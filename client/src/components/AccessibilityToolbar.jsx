import React from 'react';
import {
  X,
  Sun,
  Moon,
  Contrast,
  Type,
  AlignJustify,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AccessibilityToolbar() {
  const {
    prefs,
    updatePreferences,
    resetPreferences,
    isPanelOpen,
    setIsPanelOpen,
    announce,
    stopSpeech,
  } = useAccessibility();

  if (!isPanelOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
    >
      <div className="lumeo-card w-full max-w-md h-full overflow-y-auto p-6 sm:p-8 border-l-2 border-amber-400/50 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="a11y-panel-title" className="font-display text-xl font-bold">
                  Accessibility Panel
                </h2>
                <p className="text-xs opacity-75">WCAG 2.1 AAA Real-Time Personalization</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPanelOpen(false)}
              aria-label="Close Accessibility Panel"
              className="lumeo-btn-secondary w-11 h-11 rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* 1. Theme Mode (Luminous Dark vs Warm Cream Light) */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              1. Color Theme (7:1+ AAA Contrast)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  updatePreferences({ theme: 'dark', highContrast: false });
                  announce('Luminous Dark theme activated');
                }}
                aria-pressed={prefs.theme === 'dark' && !prefs.highContrast}
                className={`min-h-[48px] rounded-xl border px-4 py-2.5 flex items-center justify-center gap-2 font-bold text-sm ${
                  prefs.theme === 'dark' && !prefs.highContrast
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'lumeo-btn-secondary'
                }`}
              >
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>Obsidian Dark</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updatePreferences({ theme: 'light', highContrast: false });
                  announce('Warm Daylight theme activated');
                }}
                aria-pressed={prefs.theme === 'light' && !prefs.highContrast}
                className={`min-h-[48px] rounded-xl border px-4 py-2.5 flex items-center justify-center gap-2 font-bold text-sm ${
                  prefs.theme === 'light' && !prefs.highContrast
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'lumeo-btn-secondary'
                }`}
              >
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span>Warm Light</span>
              </button>
            </div>
          </div>

          {/* 2. Font Size Scale (Minimum 18px base) */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4" aria-hidden="true" />
              <span>2. Fluid Font Scaling (18px – 24px)</span>
            </span>
            <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Font size options">
              {[
                { id: 'normal', label: 'Standard (18px)' },
                { id: 'large', label: 'Large (20.5px)' },
                { id: 'xlarge', label: 'Extra (23.5px)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updatePreferences({ fontSize: item.id });
                    announce(`Font size set to ${item.label}`);
                  }}
                  aria-pressed={prefs.fontSize === item.id}
                  className={`min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold ${
                    prefs.fontSize === item.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'lumeo-btn-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Line Spacing */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlignJustify className="w-4 h-4" aria-hidden="true" />
              <span>3. Line & Paragraph Spacing</span>
            </span>
            <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Line spacing options">
              {[
                { id: 'normal', label: 'Default (1.75x)' },
                { id: 'relaxed', label: 'Relaxed (2.05x)' },
                { id: 'wide', label: 'Wide (2.35x)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updatePreferences({ lineSpacing: item.id });
                    announce(`Line spacing set to ${item.label}`);
                  }}
                  aria-pressed={prefs.lineSpacing === item.id}
                  className={`min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold ${
                    prefs.lineSpacing === item.id
                      ? 'bg-teal-400 text-slate-950 border-teal-300'
                      : 'lumeo-btn-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Toggles: High Contrast, Dyslexia Font, Reduce Motion, TTS Mute */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const next = !prefs.highContrast;
                updatePreferences({ highContrast: next });
                announce(next ? 'Ultra high contrast enabled' : 'Ultra high contrast disabled');
              }}
              aria-pressed={prefs.highContrast}
              className={`w-full min-h-[52px] px-4 py-3 rounded-xl border flex items-center justify-between font-bold text-sm ${
                prefs.highContrast
                  ? 'bg-yellow-400 text-black border-white'
                  : 'lumeo-btn-secondary'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Contrast className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <span>Ultra High-Contrast (19.5:1 AAA)</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/20">
                {prefs.highContrast ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !prefs.dyslexiaFont;
                updatePreferences({ dyslexiaFont: next });
                announce(next ? 'OpenDyslexic font enabled' : 'OpenDyslexic font disabled');
              }}
              aria-pressed={prefs.dyslexiaFont}
              className={`w-full min-h-[52px] px-4 py-3 rounded-xl border flex items-center justify-between font-bold text-sm ${
                prefs.dyslexiaFont
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'lumeo-btn-secondary'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-teal-400" aria-hidden="true" />
                <span>Dyslexia-Friendly Font (OpenDyslexic)</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/20">
                {prefs.dyslexiaFont ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !prefs.reduceMotion;
                updatePreferences({ reduceMotion: next });
                announce(next ? 'Reduced motion enabled' : 'Animations enabled');
              }}
              aria-pressed={prefs.reduceMotion}
              className={`w-full min-h-[52px] px-4 py-3 rounded-xl border flex items-center justify-between font-bold text-sm ${
                prefs.reduceMotion
                  ? 'bg-teal-400 text-slate-950 border-teal-300'
                  : 'lumeo-btn-secondary'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <span>Reduce Motion & Animations</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/20">
                {prefs.reduceMotion ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !prefs.globalMute;
                if (next) stopSpeech();
                updatePreferences({ globalMute: next });
                announce(next ? 'Text to speech muted' : 'Text to speech active');
              }}
              aria-pressed={!prefs.globalMute}
              className={`w-full min-h-[52px] px-4 py-3 rounded-xl border flex items-center justify-between font-bold text-sm ${
                !prefs.globalMute
                  ? 'bg-amber-400/20 border-amber-400'
                  : 'bg-rose-950/60 border-rose-500 text-rose-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {prefs.globalMute ? (
                  <VolumeX className="w-5 h-5 text-rose-400" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-400" aria-hidden="true" />
                )}
                <span>Text-to-Speech (TTS) Audio Output</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/20">
                {prefs.globalMute ? 'MUTED' : 'ACTIVE'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Reset */}
        <div className="pt-6 border-t border-amber-500/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetPreferences}
            className="lumeo-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="lumeo-btn-primary px-6 py-2.5 rounded-xl text-sm font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
