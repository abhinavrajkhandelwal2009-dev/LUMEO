import React, { useState, useRef } from 'react';
import { Hand, Camera, Sparkles, Trash2, Volume2 } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const COMMON_SIGNS = [
  { gloss: 'HELLO', phrase: 'Hello' },
  { gloss: 'THANK-YOU', phrase: 'Thank you' },
  { gloss: 'PLEASE', phrase: 'Please' },
  { gloss: 'HELP-ME', phrase: 'I need assistance' },
  { gloss: 'WHERE', phrase: 'Where is' },
  { gloss: 'DOCTOR', phrase: 'a doctor / medical help' },
  { gloss: 'WATER', phrase: 'water' },
  { gloss: 'UNDERSTAND', phrase: 'I understand' },
  { gloss: 'SLOW-PLEASE', phrase: 'Please sign or speak more slowly' },
  { gloss: 'YES', phrase: 'Yes' },
  { gloss: 'NO', phrase: 'No' },
  { gloss: 'NAME-MY', phrase: 'My name is' },
];

export default function SignLanguageModule() {
  const { speakText, announce } = useAccessibility();
  const [signSystem, setSignSystem] = useState('ASL (American Sign Language)');
  const [gestureQueue, setGestureQueue] = useState(['HELLO', 'HELP-ME', 'PLEASE']);
  const [customInput, setCustomInput] = useState('HELLO HELP-ME PLEASE');
  const [cameraActive, setCameraActive] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addGesture = (sign) => {
    const updated = [...gestureQueue, sign.gloss];
    setGestureQueue(updated);
    setCustomInput(updated.join(' '));
    announce(`Added sign ${sign.gloss}`);
  };

  const clearSequence = () => {
    setGestureQueue([]);
    setCustomInput('');
    setImageBase64(null);
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      announce('Webcam unavailable. Using interactive gesture pad and image upload.');
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImageBase64(dataUrl);
    announce('Captured hand gesture frame for AI translation.');
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    const payload = customInput.trim() || gestureQueue.join(' ');
    if (!payload) return;

    setLoading(true);
    try {
      const res = await processModuleAI('sign-language', payload, {
        signSystem,
        gestureSequence: gestureQueue,
        imageBase64,
      });
      setResult(res.data);
      announce('Sign language translation complete');
    } catch {
      announce('Error translating sign sequence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="AI Sign Language & Gesture Translator"
      category="Communication"
      description="Recognizes or simulates hand gesture sequences (ASL, BSL, ISL) and translates them into natural conversational sentences and spoken audio."
      icon={Hand}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gesture Input Builder & Camera */}
        <section className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label
                htmlFor="sign-system-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 hc-accent mb-1"
              >
                Sign Language Standard
              </label>
              <select
                id="sign-system-select"
                value={signSystem}
                onChange={(e) => setSignSystem(e.target.value)}
                className="hc-input px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option>ASL (American Sign Language)</option>
                <option>BSL (British Sign Language)</option>
                <option>ISL (Indian Sign Language)</option>
                <option>Auslan (Australian Sign Language)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={toggleCamera}
              className="hc-card inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold hover:bg-slate-100 focus:ring-4 focus:ring-blue-600"
            >
              <Camera className="w-4 h-4 text-blue-700 hc-accent" aria-hidden="true" />
              <span>{cameraActive ? 'Close Webcam' : 'Use Webcam Gesture Capture'}</span>
            </button>
          </div>

          {cameraActive && (
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Live webcam feed for sign language gesture recognition"
                className="w-full h-56 object-cover rounded-lg border border-slate-700"
              />
              <button
                type="button"
                onClick={captureFrame}
                className="hc-button-primary px-4 py-2 rounded-lg bg-yellow-400 text-slate-950 font-bold text-xs"
              >
                Capture Gesture Frame
              </button>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-800 hc-accent mb-2">
              Interactive Hand Sign Gloss Pad (Click or Tap to Build Sequence)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_SIGNS.map((sign) => (
                <button
                  key={sign.gloss}
                  type="button"
                  onClick={() => addGesture(sign)}
                  className="hc-card p-2.5 rounded-xl border border-slate-300 text-left hover:border-blue-500 hover:bg-blue-50/40 transition-colors focus:ring-4 focus:ring-blue-600"
                >
                  <span className="block text-xs font-extrabold text-blue-700 hc-accent">
                    ✋ {sign.gloss}
                  </span>
                  <span className="block text-xs text-slate-600 hc-accent truncate">
                    {sign.phrase}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="sign-sequence-input"
                  className="text-sm font-bold text-slate-800 hc-accent"
                >
                  Gesture Sequence / Gloss Input
                </label>
                <button
                  type="button"
                  onClick={clearSequence}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Clear
                </button>
              </div>
              <textarea
                id="sign-sequence-input"
                rows={3}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter sign gloss sequence (e.g., HELLO WHERE DOCTOR PLEASE)..."
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customInput.trim()}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Translating Gesture Sequence...' : 'Translate Signs to Text & Speech'}
              </span>
            </button>
          </form>
        </section>

        {/* Translation Output */}
        <section
          aria-live="polite"
          className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Natural Language & Speech Output
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Select gestures from the pad or capture a frame, then click "Translate Signs to Text & Speech" to generate spoken-ready translations and fingerspelling breakdowns.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 hc-card">
                <span className="text-xs font-bold uppercase text-blue-700 hc-accent">
                  Spoken Phrase
                </span>
                <p className="text-xl font-extrabold text-slate-900 hc-accent mt-1">
                  {result.spokenPhrase || result.naturalTranslation}
                </p>
                <p className="text-xs text-slate-600 hc-accent mt-1">
                  Confidence: {result.confidence}
                </p>
              </div>

              <AudioPlayer
                text={result.spokenPhrase || result.naturalTranslation}
                title="Speak Sign Translation Aloud"
              />

              {Array.isArray(result.fingerSpelling) && result.fingerSpelling.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Fingerspelling Guide
                  </h3>
                  <div className="space-y-1.5">
                    {result.fingerSpelling.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-slate-100 hc-card text-xs font-mono font-bold"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(result.suggestedResponses) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Quick Tap Spoken Replies
                  </h3>
                  <div className="space-y-2">
                    {result.suggestedResponses.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => speakText(reply)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-blue-50 hc-card text-xs font-semibold flex items-center justify-between gap-2"
                      >
                        <span>{reply}</span>
                        <Volume2 className="w-4 h-4 shrink-0 text-blue-700 hc-accent" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

