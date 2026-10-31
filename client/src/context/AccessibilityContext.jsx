import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AccessibilityContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

const getSystemReducedMotion = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

const DEFAULT_PREFS = {
  theme: getSystemTheme(), // 'dark' (deep indigo/obsidian) | 'light' (warm cream)
  highContrast: false,
  fontSize: 'normal', // 'normal' (18px) | 'large' (20.5px) | 'xlarge' (23.5px)
  lineSpacing: 'normal', // 'normal' | 'relaxed' | 'wide'
  dyslexiaFont: false,
  reduceMotion: getSystemReducedMotion(),
  speechRate: 1.0,
  speechPitch: 1.0,
  defaultLanguage: 'English',
  globalMute: false,
  colorOverlay: 'none',
};

export function AccessibilityProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lumeo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('lumeo_prefs_v2');
      if (saved) return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFS;
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Synchronize HTML & Body classes for theme, high-contrast, font-size, line-spacing, dyslexia, and reduced motion
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    // Theme (dark / light)
    if (prefs.theme === 'light') {
      htmlEl.classList.remove('dark');
    } else {
      htmlEl.classList.add('dark');
    }

    // Font Size Scale
    htmlEl.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    htmlEl.classList.add(`font-scale-${prefs.fontSize || 'normal'}`);

    // Line Spacing
    bodyEl.classList.remove('line-spacing-normal', 'line-spacing-relaxed', 'line-spacing-wide');
    bodyEl.classList.add(`line-spacing-${prefs.lineSpacing || 'normal'}`);

    // High Contrast
    if (prefs.highContrast) {
      bodyEl.classList.add('high-contrast-mode');
    } else {
      bodyEl.classList.remove('high-contrast-mode');
    }

    // Dyslexia Font
    if (prefs.dyslexiaFont) {
      bodyEl.classList.add('dyslexia-mode');
    } else {
      bodyEl.classList.remove('dyslexia-mode');
    }

    // Reduce Motion
    if (prefs.reduceMotion) {
      bodyEl.classList.add('reduce-motion');
    } else {
      bodyEl.classList.remove('reduce-motion');
    }

    localStorage.setItem('lumeo_prefs_v2', JSON.stringify(prefs));
  }, [prefs]);

  const announce = useCallback((message) => {
    setAnnouncement(message);
  }, []);

  const speakText = useCallback(
    (text, overrideRate = null, overridePitch = null) => {
      if (prefs.globalMute || !text) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.rate = overrideRate || prefs.speechRate || 1.0;
        utterance.pitch = overridePitch || prefs.speechPitch || 1.0;
        window.speechSynthesis.speak(utterance);
      }
    },
    [prefs.globalMute, prefs.speechRate, prefs.speechPitch]
  );

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const updatePreferences = useCallback(
    async (partialPrefs, persistToServer = true) => {
      const nextPrefs = { ...prefs, ...partialPrefs };
      setPrefs(nextPrefs);

      if (persistToServer && user && localStorage.getItem('lumeo_token')) {
        try {
          const res = await api.put('/user/profile', {
            accessibility_prefs: nextPrefs,
          });
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('lumeo_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Could not sync preferences to server:', err.message);
        }
      }
    },
    [prefs, user]
  );

  const resetPreferences = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    announce('Accessibility settings reset to defaults');
  }, [announce]);

  const loginUser = useCallback((token, userData) => {
    localStorage.setItem('lumeo_token', token);
    localStorage.setItem('lumeo_user', JSON.stringify(userData));
    setUser(userData);
    if (userData?.accessibility_prefs) {
      setPrefs((prev) => ({ ...prev, ...userData.accessibility_prefs }));
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('lumeo_token');
    localStorage.removeItem('lumeo_user');
    setUser(null);
    stopSpeech();
    announce('Signed out successfully');
  }, [stopSpeech, announce]);

  useEffect(() => {
    const token = localStorage.getItem('lumeo_token');
    if (token) {
      api
        .get('/user/profile')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('lumeo_user', JSON.stringify(res.data.user));
            if (res.data.user.accessibility_prefs) {
              setPrefs((prev) => ({ ...prev, ...res.data.user.accessibility_prefs }));
            }
          }
        })
        .catch(() => { });
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        user,
        setUser,
        prefs,
        updatePreferences,
        resetPreferences,
        isPanelOpen,
        setIsPanelOpen,
        loginUser,
        logoutUser,
        speakText,
        stopSpeech,
        announce,
      }}
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
}
