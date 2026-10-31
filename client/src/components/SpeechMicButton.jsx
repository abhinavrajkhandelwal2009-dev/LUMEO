import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function SpeechMicButton({
  onTranscript,
  language = 'en-US',
  continuous = false,
  buttonLabel = 'Voice Input',
}) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

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

  const toggleListening = () => {
    setErrorMsg('');
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Browser SpeechRecognition API not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript.trim() && onTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      setErrorMsg(`Microphone notice: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggleListening}
        aria-pressed={isListening}
        aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors focus:ring-4 focus:ring-blue-600 ${
          isListening
            ? 'bg-red-600 text-white border-red-700 animate-pulse'
            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hc-card'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" aria-hidden="true" />
            <span>Stop Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-blue-700 hc-accent" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
      {errorMsg && (
        <span role="alert" className="inline-flex items-center gap-1 text-xs text-amber-700">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          {errorMsg}
        </span>
      )}
    </div>
  );
}

