import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, User, History } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAccessibility } from '../context/AccessibilityContext';
import api, { fetchUserInteractions } from '../utils/api';

export default function Profile() {
  const { user, setUser, prefs, updatePreferences, announce, speakText } = useAccessibility();

  const [name, setName] = useState(user?.name || '');
  const [savedBanner, setSavedBanner] = useState('');
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserInteractions()
        .then((data) => setInteractions(data || []))
        .catch(() => {});
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavedBanner('');

    updatePreferences(prefs, false);

    if (user && localStorage.getItem('lumeo_token')) {
      try {
        const res = await api.put('/user/profile', {
          name,
          accessibility_prefs: prefs,
        });
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('lumeo_user', JSON.stringify(res.data.user));
        }
        setSavedBanner('Preferences synced to your PostgreSQL profile.');
        announce('Accessibility preferences saved.');
      } catch {
        setSavedBanner('Preferences saved locally on this device.');
      }
    } else {
      setSavedBanner('Preferences saved locally on this browser.');
      announce('Preferences saved locally.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="hc-card bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <User className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 hc-accent">
                User Accessibility Preferences
              </h1>
              <p className="text-sm text-slate-600 hc-accent">
                Customize contrast, font scaling, dyslexia typography, voice speed, and default language.
              </p>
            </div>
          </div>

          {savedBanner && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span>{savedBanner}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
                  >
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
                  >
                    Account Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={user.email}
                    className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Font Size Preference */}
              <div>
                <label
                  htmlFor="pref-font-size"
                  className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
                >
                  Global Font Scaling
                </label>
                <select
                  id="pref-font-size"
                  value={prefs.fontSize}
                  onChange={(e) => updatePreferences({ fontSize: e.target.value }, false)}
                  className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  <option value="normal">Normal (16px Base)</option>
                  <option value="large">Large (19px Base - A+)</option>
                  <option value="xlarge">Extra Large (22px Base - A++)</option>
                </select>
              </div>

              {/* Default Translation / Output Language */}
              <div>
                <label
                  htmlFor="pref-language"
                  className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
                >
                  Default Preferred Language
                </label>
                <select
                  id="pref-language"
                  value={prefs.defaultLanguage || 'English'}
                  onChange={(e) => updatePreferences({ defaultLanguage: e.target.value }, false)}
                  className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  {[
                    'English',
                    'Spanish',
                    'French',
                    'German',
                    'Hindi',
                    'Mandarin Chinese',
                    'Arabic',
                    'Portuguese',
                    'Japanese',
                  ].map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Synthesis Speed */}
              <div>
                <label
                  htmlFor="pref-speech-rate"
                  className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
                >
                  Default Voice Speed ({prefs.speechRate}x)
                </label>
                <input
                  id="pref-speech-rate"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={prefs.speechRate}
                  onChange={(e) =>
                    updatePreferences({ speechRate: parseFloat(e.target.value) }, false)
                  }
                  className="w-full accent-blue-700"
                />
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      `Testing your LUMEO voice speed at ${prefs.speechRate} times normal speed.`
                    )
                  }
                  className="mt-2 text-xs font-bold text-blue-700 hc-accent hover:underline"
                >
                  Test Voice Speed Sample
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(prefs.highContrast)}
                    onChange={(e) =>
                      updatePreferences({ highContrast: e.target.checked }, false)
                    }
                    className="w-5 h-5 rounded accent-blue-700"
                  />
                  <span className="text-sm font-bold text-slate-800 hc-accent">
                    Enable WCAG AAA High-Contrast Mode
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(prefs.dyslexiaFont)}
                    onChange={(e) =>
                      updatePreferences({ dyslexiaFont: e.target.checked }, false)
                    }
                    className="w-5 h-5 rounded accent-blue-700"
                  />
                  <span className="text-sm font-bold text-slate-800 hc-accent">
                    Enable OpenDyslexic Typography & Wide Spacing
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(prefs.globalMute)}
                    onChange={(e) =>
                      updatePreferences({ globalMute: e.target.checked }, false)
                    }
                    className="w-5 h-5 rounded accent-blue-700"
                  />
                  <span className="text-sm font-bold text-slate-800 hc-accent">
                    Mute Global Text-to-Speech Output
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="hc-button-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 focus:ring-4 focus:ring-blue-600"
              >
                <Save className="w-5 h-5" aria-hidden="true" />
                <span>Save Accessibility Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Full User Interaction History */}
        {user && (
          <section
            aria-labelledby="profile-history-heading"
            className="hc-card bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-blue-700 hc-accent" aria-hidden="true" />
              <h2
                id="profile-history-heading"
                className="text-xl font-extrabold text-slate-900 hc-accent"
              >
                Saved Interaction History ({interactions.length})
              </h2>
            </div>

            {interactions.length === 0 ? (
              <p className="text-sm text-slate-600 hc-accent">
                No interactions logged yet. Try any of the 15 accessibility modules to automatically log your history.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {interactions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hc-card"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {item.module_name}
                      </span>
                      <span className="text-xs text-slate-500 hc-accent">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 hc-accent">
                      Input: {item.input_payload}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

