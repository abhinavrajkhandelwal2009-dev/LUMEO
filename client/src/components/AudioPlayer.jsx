import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AudioPlayer({ text, title = 'Audio Narration' }) {
  const { prefs, updatePreferences } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(prefs.speechRate || 1.0);
  const [pitch, setPitch] = useState(prefs.speechPitch || 1.0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRate(prefs.speechRate || 1.0);
  }, [prefs.speechRate]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!text || prefs.globalMute) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="hc-card bg-slate-100 border border-slate-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
      role="region"
      aria-label={title}
    >
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-blue-700 hc-accent" aria-hidden="true" />
        <span className="font-semibold text-sm text-slate-800 hc-accent">{title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            disabled={!text || prefs.globalMute}
            aria-label={isPaused ? 'Resume speech playback' : 'Play text-to-speech audio'}
            className="hc-button-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 focus:ring-4 focus:ring-blue-600"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>{isPaused ? 'Resume' : 'Listen'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause speech playback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 focus:ring-4 focus:ring-blue-600"
          >
            <Pause className="w-4 h-4" aria-hidden="true" />
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop speech playback"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 focus:ring-4 focus:ring-blue-600"
          >
            <Square className="w-4 h-4" aria-hidden="true" />
            <span>Stop</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor={`rate-${title}`} className="font-medium text-slate-700 hc-accent">
            Speed: {rate}x
          </label>
          <input
            id={`rate-${title}`}
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => {
              const next = parseFloat(e.target.value);
              setRate(next);
              updatePreferences({ speechRate: next }, false);
            }}
            aria-label="Speech playback speed"
            className="w-20 accent-blue-700 focus:ring-4 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor={`pitch-${title}`} className="font-medium text-slate-700 hc-accent">
            Pitch: {pitch}
          </label>
          <input
            id={`pitch-${title}`}
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            aria-label="Speech pitch"
            className="w-16 accent-blue-700 focus:ring-4 focus:ring-blue-600"
          />
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy text to clipboard"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-medium hover:bg-slate-50 focus:ring-4 focus:ring-blue-600"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>

        {prefs.globalMute && (
          <span className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold">
            <VolumeX className="w-4 h-4" aria-hidden="true" />
            Muted globally
          </span>
        )}
      </div>
    </div>
  );
}

