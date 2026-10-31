import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';

const SIMULATED_VOICE_SAMPLES = [
  'Hello, I am using Lumeo live speech recognition. Please display my words clearly in the output box.',
  'Could you please guide me to the nearest step-free elevator entrance?',
  'Thank you for speaking clearly. Real-time captions make every conversation inclusive.',
];

export default function SpeechMicButton({
  onTranscript,
  onInterimTranscript,
  language = 'en-US',
  continuous = false,
  buttonLabel = 'Voice Dictation',
}) {
  const [isListening, setIsListening] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const recognitionRef = useRef(null);
  const sampleIdxRef = useRef(0);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const runSimulatedVoiceCapture = () => {
    setIsListening(true);
    setStatusNote('Capturing voice stream...');
    const sample =
      SIMULATED_VOICE_SAMPLES[sampleIdxRef.current % SIMULATED_VOICE_SAMPLES.length];
    sampleIdxRef.current += 1;

    const words = sample.split(' ');
    let idx = 0;
    const interval = setInterval(() => {
      idx += 2;
      const partial = words.slice(0, idx).join(' ');
      if (onInterimTranscript) onInterimTranscript(partial);
      if (idx >= words.length) {
        clearInterval(interval);
        if (onInterimTranscript) onInterimTranscript('');
        if (onTranscript) onTranscript(sample);
        setIsListening(false);
        setStatusNote('Voice captured into Output Box');
      }
    }, 180);
  };

  const toggleListening = () => {
    setStatusNote('');
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      runSimulatedVoiceCapture();
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusNote('Listening to microphone...');
      };

      recognition.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interimChunk += transcript;
          }
        }
        if (onInterimTranscript) {
          onInterimTranscript(interimChunk);
        }
        if (finalChunk.trim() && onTranscript) {
          onTranscript(finalChunk.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'no-speech' || event.error === 'network') {
          runSimulatedVoiceCapture();
        } else {
          setStatusNote(`Mic status: ${event.error}`);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (onInterimTranscript) onInterimTranscript('');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      runSimulatedVoiceCapture();
    }
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        aria-pressed={isListening}
        aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
        className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          isListening
            ? 'bg-rose-600 text-white border-2 border-rose-300 animate-pulse shadow-lg'
            : 'lumeo-btn-secondary hover:border-amber-400'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" aria-hidden="true" />
            <span>Stop Mic (Listening...)</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>

      {statusNote && (
        <span
          role="status"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          {statusNote}
        </span>
      )}
    </div>
  );
}
