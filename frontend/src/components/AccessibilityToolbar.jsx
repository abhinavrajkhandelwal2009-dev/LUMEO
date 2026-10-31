import React from 'react';
import { Contrast, Type, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AccessibilityToolbar() {
  const { prefs, updatePreferences, announce, stopSpeech } = useAccessibility();

  const handleToggleContrast = () => {
    const next = !prefs.highContrast;
    updatePreferences({ highContrast: next });
    announce(next ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const handleFontSizeChange = (size) => {
    updatePreferences({ fontSize: size });
    announce(`Font size set to ${size}`);
  };

  const handleToggleDyslexia = () => {
    const next = !prefs.dyslexiaFont;
    updatePreferences({ dyslexiaFont: next });
    announce(next ? 'Dyslexia-friendly font enabled' : 'Standard font enabled');
  };

  const handleToggleMute = () => {
    const next = !prefs.globalMute;
    if (next) stopSpeech();
    updatePreferences({ globalMute: next });
    announce(next ? 'Global Text-to-Speech muted' : 'Global Text-to-Speech unmuted');
  };

  return (
    <div
      role="toolbar"
      aria-label="Global Accessibility Controls"
      className="flex flex-wrap items-center gap-2 bg-slate-100 hc-card px-3 py-1.5 rounded-xl border border-slate-300"
    >
      {/* High Contrast Toggle */}
      <button
        type="button"
        onClick={handleToggleContrast}
        aria-pressed={prefs.highContrast}
        aria-label="Toggle High Contrast Mode"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-4 focus:ring-blue-600 ${
          prefs.highContrast
            ? 'bg-yellow-400 text-black border border-white'
            : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-200'
        }`}
      >
        <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Contrast</span>
      </button>

      {/* Font Size Scale (Normal, Large, Extra Large) */}
      <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 hc-card" role="group" aria-label="Font size scale">
        <Type className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-600 hc-accent" aria-hidden="true" />
        {[
          { key: 'normal', label: 'A', aria: 'Normal font size' },
          { key: 'large', label: 'A+', aria: 'Large font size' },
          { key: 'xlarge', label: 'A++', aria: 'Extra large font size' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleFontSizeChange(item.key)}
            aria-pressed={prefs.fontSize === item.key}
            aria-label={item.aria}
            className={`px-2 py-1 rounded text-xs font-bold transition-colors focus:ring-4 focus:ring-blue-600 ${
              prefs.fontSize === item.key
                ? 'bg-blue-700 text-white hc-button-primary'
                : 'text-slate-700 hover:bg-slate-100 hc-accent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Dyslexia Font Mode */}
      <button
        type="button"
        onClick={handleToggleDyslexia}
        aria-pressed={prefs.dyslexiaFont}
        aria-label="Toggle OpenDyslexic Font Mode"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-4 focus:ring-blue-600 ${
          prefs.dyslexiaFont
            ? 'bg-blue-700 text-white hc-button-primary'
            : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-200'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Dyslexia Font</span>
      </button>

      {/* Global Text-to-Speech Mute */}
      <button
        type="button"
        onClick={handleToggleMute}
        aria-pressed={prefs.globalMute}
        aria-label={prefs.globalMute ? 'Unmute global speech' : 'Mute global speech'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-4 focus:ring-blue-600 ${
          prefs.globalMute
            ? 'bg-red-700 text-white'
            : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-200'
        }`}
      >
        {prefs.globalMute ? (
          <>
            <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            <span>TTS Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>TTS On</span>
          </>
        )}
      </button>
    </div>
  );
}

