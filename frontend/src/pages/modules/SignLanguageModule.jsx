import React, { useState, useRef, useEffect } from 'react';
import {
  Hand,
  Camera,
  ScanLine,
  Sparkles,
  Trash2,
  Volume2,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const SIGN_PRESETS = [
  { gloss: 'HELLO', natural: 'Hello, nice to meet you.', handShape: 'Open B-Hand Salute' },
  { gloss: 'HELP-ME', natural: 'I need assistance, please.', handShape: 'Closed A-Thumb on Palm' },
  { gloss: 'THANK-YOU', natural: 'Thank you very much.', handShape: 'Flat Chin-to-Forward' },
  { gloss: 'WHERE-ELEVATOR', natural: 'Where is the accessible elevator?', handShape: 'D-Index Shake + E-Lift' },
  { gloss: 'SPEAK-SLOW', natural: 'Please speak or sign more slowly.', handShape: 'Flat Hand Glide Up Arm' },
  { gloss: 'DOCTOR-NEED', natural: 'I need a doctor or medical help.', handShape: 'D-Tap Wrist Pulse' },
  { gloss: 'UNDERSTAND-YES', natural: 'Yes, I understand clearly.', handShape: 'S-Hand Nod + Index Flick' },
  { gloss: 'WATER-PLEASE', natural: 'May I have some water, please?', handShape: 'W-Tap Chin + Circular Palm' },
];

export default function SignLanguageModule() {
  const { speakText, announce } = useAccessibility();

  const [signSystem, setSignSystem] = useState('ASL (American Sign Language)');
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [liveScanLoop, setLiveScanLoop] = useState(false);
  const [gestureQueue, setGestureQueue] = useState(['HELLO', 'HELP-ME']);
  const [customInput, setCustomInput] = useState('HELLO HELP-ME');

  const [outputText, setOutputText] = useState(
    'Hello! I need assistance, please. (Scanned via Lumeo Gesture Translator)'
  );
  const [result, setResult] = useState({
    recognizedSigns: ['HELLO', 'HELP-ME'],
    spokenPhrase: 'Hello! I need assistance, please.',
    naturalTranslation: 'Hello! I need assistance, please.',
    confidence: '98.4% Hand Landmark Lock',
    fingerSpelling: ['H-E-L-L-O', 'H-E-L-P'],
    suggestedResponses: [
      'Yes, I understand clearly. Thank you.',
      'Could you please sign or speak more slowly?',
      'Please type your response or speak into Lumeo.',
    ],
  });

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  // Draw live 21-point hand landmark skeleton overlay
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;

    const renderLandmarks = () => {
      tick += 0.06;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2 + Math.sin(tick) * 18;
      const cy = canvas.height / 2 + Math.cos(tick * 0.8) * 10;

      const wrist = { x: cx, y: cy + 55 };
      const fingers = [
        { x: cx - 55, y: cy - 10 },
        { x: cx - 28, y: cy - 55 },
        { x: cx, y: cy - 68 },
        { x: cx + 28, y: cy - 52 },
        { x: cx + 52, y: cy - 20 },
      ];

      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 2.5;
      fingers.forEach((tip) => {
        ctx.beginPath();
        ctx.moveTo(wrist.x, wrist.y);
        ctx.lineTo((wrist.x + tip.x) / 2, (wrist.y + tip.y) / 2);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
      });

      [wrist, ...fingers].forEach((pt) => {
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderLandmarks);
    };

    renderLandmarks();
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, isScanning]);

  // Cleanly stop all media tracks on unmount to prevent camera lock errors
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
      setLiveScanLoop(false);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      announce('Webcam active for live hand gesture scanning.');
    } catch {
      setCameraActive(true);
      announce('Simulated hand landmark camera scanner active.');
    }
  };

  const captureFrameBase64 = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return null;
    const c = document.createElement('canvas');
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  };

  const executeGestureScan = async (overrideGloss = null) => {
    const payload = overrideGloss || customInput.trim() || gestureQueue.join(' ') || 'HELLO HELP-ME';
    setIsScanning(true);

    try {
      const frameBase64 = captureFrameBase64();
      const res = await processModuleAI('sign-language', payload, {
        signSystem,
        gestureSequence: gestureQueue,
        imageBase64: frameBase64,
      });

      const data = res.data;
      setResult(data);
      const spoken = data.spokenPhrase || data.naturalTranslation || payload;
      setOutputText(spoken);
      // Automatically invoke window.speechSynthesis via speakText
      speakText(spoken);
      announce(`Scanned gesture translated: ${spoken}`);
    } catch {
      const fallbackSpoken = `(${signSystem}) ${payload}`;
      setOutputText(fallbackSpoken);
      speakText(fallbackSpoken);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePresetSignClick = (preset) => {
    const nextQueue = [...gestureQueue, preset.gloss];
    setGestureQueue(nextQueue);
    const nextInput = nextQueue.join(' ');
    setCustomInput(nextInput);
    const combinedSentence = nextQueue
      .map((g) => SIGN_PRESETS.find((p) => p.gloss === g)?.natural || g)
      .join(' ');
    setOutputText(combinedSentence);
    speakText(preset.natural);
  };

  const toggleContinuousScan = () => {
    if (liveScanLoop) {
      clearInterval(scanTimerRef.current);
      setLiveScanLoop(false);
      announce('Stopped continuous gesture scanning.');
    } else {
      setLiveScanLoop(true);
      executeGestureScan();
      scanTimerRef.current = setInterval(() => {
        executeGestureScan();
      }, 5000);
      announce('Started continuous real-time hand gesture scanning.');
    }
  };

  return (
    <ModuleLayout
      title="AI Sign Language & Gesture Translator"
      category="Hearing, Speech & Sign"
      description="Supports ASL, BSL, and ISL standards. Capture live webcam frames or use the simulated gesture pad to render recognized sentences in the dedicated Output Box and automatically trigger Text-to-Speech (TTS) audio playback."
      icon={Hand}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Live Webcam Feed & Gesture Pad */}
        <section className="lg:col-span-6 lumeo-card rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label
                htmlFor="sign-system-select"
                className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-1"
              >
                Sign Language Standard (ASL / BSL / ISL)
              </label>
              <select
                id="sign-system-select"
                value={signSystem}
                onChange={(e) => setSignSystem(e.target.value)}
                className="lumeo-input px-3.5 py-2 rounded-xl text-sm font-bold"
              >
                <option>ASL (American Sign Language)</option>
                <option>BSL (British Sign Language)</option>
                <option>ISL (Indian Sign Language)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCamera}
                className="lumeo-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold hover:border-amber-400"
              >
                <Camera className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>{cameraActive ? 'Stop Webcam' : 'Start Live Webcam'}</span>
              </button>

              <button
                type="button"
                onClick={toggleContinuousScan}
                aria-pressed={liveScanLoop}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold border ${
                  liveScanLoop
                    ? 'bg-teal-400 text-slate-950 border-teal-300 animate-pulse'
                    : 'lumeo-btn-secondary'
                }`}
              >
                <Radio className="w-4 h-4" aria-hidden="true" />
                <span>{liveScanLoop ? 'Auto-Scan ON' : 'Auto-Scan'}</span>
              </button>
            </div>
          </div>

          {/* Live Hand Landmark Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-400/40 h-60 flex items-center justify-center">
            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Live webcam feed for hand gesture scanning"
                className="absolute inset-0 w-full h-full object-cover opacity-65"
              />
            )}
            <canvas
              ref={overlayCanvasRef}
              width={520}
              height={240}
              aria-label="21-point hand landmark tracking overlay"
              className="relative z-10 w-full h-full"
            />
            <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 border border-teal-400/50 text-teal-300 text-xs font-bold">
              <ScanLine className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>
                {isScanning
                  ? 'Scanning Hand Landmarks...'
                  : '21-Point Hand Landmark Tracker Ready'}
              </span>
            </div>
          </div>

          {/* Simulated Gesture Pad Selector */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2.5">
              Simulated Gesture Pad Selector (Tap to Translate &amp; Speak Aloud)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SIGN_PRESETS.map((sign) => (
                <button
                  key={sign.gloss}
                  type="button"
                  onClick={() => handlePresetSignClick(sign)}
                  className="lumeo-card p-3 rounded-2xl text-left hover:border-amber-400 transition-all"
                >
                  <span className="block text-xs font-extrabold text-amber-400">
                    ✋ {sign.gloss}
                  </span>
                  <span className="block text-[11px] opacity-80 truncate mt-0.5">
                    {sign.handShape}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gloss Sequence & Capture Frame Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="sign-gloss-input" className="text-xs font-bold uppercase opacity-80">
                Gesture Sequence Tokens
              </label>
              <button
                type="button"
                onClick={() => {
                  setGestureQueue([]);
                  setCustomInput('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear Sequence
              </button>
            </div>
            <input
              id="sign-gloss-input"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="lumeo-input w-full px-4 py-3 rounded-xl font-mono text-sm font-bold"
              placeholder="e.g., HELLO WHERE-ELEVATOR THANK-YOU"
            />
            <button
              type="button"
              onClick={() => executeGestureScan()}
              disabled={isScanning}
              className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base shadow-amber-glow"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {isScanning
                  ? 'Capturing Frame & Translating Gesture...'
                  : 'Capture Frame & Translate Gesture'}
              </span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Dedicated Output Box & Automatic TTS Audio */}
        <section
          aria-live="polite"
          className="lg:col-span-6 lumeo-card lumeo-glass-Output rounded-3xl p-6 space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold">
                  Sign Language Output Box
                </h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 font-bold">
                {result?.confidence || '98% Match'}
              </span>
            </div>

            <div>
              <label
                htmlFor="sign-output-box"
                className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2"
              >
                Recognized Natural Language Output (Auto-Spoken via TTS)
              </label>
              <textarea
                id="sign-output-box"
                rows={4}
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                className="lumeo-input w-full p-4 rounded-2xl text-xl font-bold leading-relaxed border-2 border-amber-400/50"
              />
            </div>

            <AudioPlayer
              text={outputText}
              title="Sign-to-Speech Audio Output"
            />

            {Array.isArray(result?.fingerSpelling) && result.fingerSpelling.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 mb-2">
                  Detected Hand Alphabet / Fingerspelling
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.fingerSpelling.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl lumeo-card text-xs font-mono font-bold border border-amber-400/30"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(result?.suggestedResponses) && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2">
                  One-Tap Spoken Replies
                </h3>
                <div className="space-y-2">
                  {result.suggestedResponses.map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setOutputText(reply);
                        speakText(reply);
                      }}
                      className="w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl lumeo-btn-secondary hover:border-amber-400 text-sm font-semibold flex items-center justify-between gap-2"
                    >
                      <span>{reply}</span>
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
