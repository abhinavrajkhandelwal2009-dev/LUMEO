import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AccessibilityContext = createContext(null);

const DEFAULT_PREFS = {
  highContrast: false,
  fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
  dyslexiaFont: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  defaultLanguage: 'English',
  globalMute: false,
  colorOverlay: 'none', // 'none' | 'warm-amber' | 'soft-blue' | 'mint-green' | 'rose-tint'
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
      const saved = localStorage.getItem('lumeo_prefs');
      if (saved) return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFS;
  });

  const [announcement, setAnnouncement] = useState('');

  // Synchronize DOM classes for WCAG high contrast, font scale, and OpenDyslexic mode
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    htmlEl.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    htmlEl.classList.add(`font-scale-${prefs.fontSize || 'normal'}`);

    if (prefs.highContrast) {
      bodyEl.classList.add('high-contrast-mode');
    } else {
      bodyEl.classList.remove('high-contrast-mode');
    }

    if (prefs.dyslexiaFont) {
      bodyEl.classList.add('dyslexia-mode');
    } else {
      bodyEl.classList.remove('dyslexia-mode');
    }

    localStorage.setItem('lumeo_prefs', JSON.stringify(prefs));
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

  // Verify user session on initial load if token exists
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
        .catch(() => {
          // Token expired or invalid
        });
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        user,
        setUser,
        prefs,
        updatePreferences,
        loginUser,
        logoutUser,
        speakText,
        stopSpeech,
        announce,
      }}
    >
      {/* Screen Reader Live Announcement Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
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

