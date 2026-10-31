import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AudioPlayer({ text, title = 'Audio Output Synthesizer' }) {
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
      // ignore
    }
  };

  const safeId = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  return (
    <div
      className="lumeo-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-amber-500/30"
      role="region"
      aria-label={title}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <Volume2 className="w-5 h-5" aria-hidden="true" />
        </span>
        <div>
          <span className="block font-bold text-sm">{title}</span>
          <span className="block text-xs opacity-75">
            {isPlaying ? 'Speaking aloud now...' : 'Ready for natural voice playback'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            disabled={!text || prefs.globalMute}
            aria-label={isPaused ? 'Resume audio playback' : 'Play audio output'}
            className="lumeo-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>{isPaused ? 'Resume Audio' : 'Speak Output'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause audio playback"
            className="lumeo-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border-amber-400"
          >
            <Pause className="w-4 h-4" aria-hidden="true" />
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop audio playback"
            className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm"
          >
            <Square className="w-4 h-4" aria-hidden="true" />
            <span>Stop</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor={`rate-${safeId}`} className="font-semibold">
            Speed {rate}x
          </label>
          <input
            id={`rate-${safeId}`}
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
            className="w-20 accent-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor={`pitch-${safeId}`} className="font-semibold">
            Pitch {pitch}
          </label>
          <input
            id={`pitch-${safeId}`}
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            aria-label="Speech pitch"
            className="w-16 accent-teal-400"
          />
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy output text to clipboard"
          className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-teal-400" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span>Copy Text</span>
            </>
          )}
        </button>

        {prefs.globalMute && (
          <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-bold">
            <VolumeX className="w-4 h-4" aria-hidden="true" />
            TTS Muted
          </span>
        )}
      </div>
    </div>
  );
}
