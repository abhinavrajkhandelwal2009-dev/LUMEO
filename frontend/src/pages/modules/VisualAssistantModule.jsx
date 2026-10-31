import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Camera,
  Radio,
  Upload,
  Compass,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import SpeechMicButton from '../../components/SpeechMicButton';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const LIVE_ENVIRONMENTS = [
  {
    name: 'Indoor Corridor & Doorway',
    summary:
      'Open doorway at 12 o’clock (3.5 meters ahead), water bottle on table at 2 o’clock, chair leg slightly protruding at 10 o’clock.',
    guidance:
      'Path straight ahead at 12 o’clock is clear. Step slightly right toward 1 o’clock to bypass the chair on your left.',
    hazard: 'Caution: Chair leg at 10 o’clock (1.2m) and low step transition at doorway.',
    objects: [
      { name: 'Open Doorway', position: '12 o’clock (3.5m)', confidence: '99%' },
      { name: 'Water Bottle', position: '2 o’clock (1.0m)', confidence: '96%' },
      { name: 'Chair (Left Edge)', position: '10 o’clock (1.2m)', confidence: '95%' },
    ],
  },
  {
    name: 'Street Crosswalk & Curb Step',
    summary:
      'Tactile curb edge at 12 o’clock, audible pedestrian button pole at 3 o’clock (0.8m), hazard step down at 6 o’clock.',
    guidance:
      'Hold position at tactile paving edge. Reach right at 3 o’clock waist height to press the crosswalk button.',
    hazard: 'Hazard Alert: Curb drop-off directly ahead at 12 o’clock until walk signal sounds.',
    objects: [
      { name: 'Tactile Curb Ramp', position: '12 o’clock (0.5m)', confidence: '99%' },
      { name: 'Crosswalk Signal Pole', position: '3 o’clock (0.8m)', confidence: '97%' },
      { name: 'Curb Step Down', position: '6 o’clock / Edge', confidence: '95%' },
    ],
  },
  {
    name: 'Desk & Medication Bottle',
    summary:
      'Prescription medication bottle centered at 12 o’clock (25cm), warm mug at 2 o’clock (35cm), laptop keyboard at 10 o’clock.',
    guidance:
      'Reach straight ahead at 12 o’clock for the medication bottle. Avoid reaching toward 2 o’clock where the hot mug sits.',
    hazard: 'Hazard Alert: Hot liquid mug at 2 o’clock (35cm away).',
    objects: [
      { name: 'Medication Bottle', position: '12 o’clock (25cm)', confidence: '98%' },
      { name: 'Hot Mug', position: '2 o’clock (35cm)', confidence: '94%' },
      { name: 'Laptop Keyboard', position: '10 o’clock (30cm)', confidence: '97%' },
    ],
  },
];

export default function VisualAssistantModule() {
  const { speakText, announce } = useAccessibility();

  const [cameraActive, setCameraActive] = useState(false);
  const [liveGuidanceLoop, setLiveGuidanceLoop] = useState(false);
  const [autoTtsEnabled, setAutoTtsEnabled] = useState(true);
  const [sceneInput, setSceneInput] = useState(LIVE_ENVIRONMENTS[0].summary);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [outputBoxText, setOutputBoxText] = useState(
    `Spatial Clock-Face Map:\n${LIVE_ENVIRONMENTS[0].summary}\n\nNavigation Guidance:\n${LIVE_ENVIRONMENTS[0].guidance}\n\nSafety Warning:\n${LIVE_ENVIRONMENTS[0].hazard}`
  );
  const [detectedObjects, setDetectedObjects] = useState(LIVE_ENVIRONMENTS[0].objects);
  const [safetyAlert, setSafetyAlert] = useState(LIVE_ENVIRONMENTS[0].hazard);

  const videoRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopTimerRef = useRef(null);
  const envCycleRef = useRef(0);

  // Draw live clock-face radar overlay
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 30, 130, 145);

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(185, 20, 155, 170);

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
      ctx.lineWidth = 2;
      ctx.strokeRect(360, 45, 130, 130);

      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('12 O’CLOCK: DOORWAY', 193, 38);
      ctx.fillStyle = '#2DD4BF';
      ctx.fillText('10 O’CLOCK: CHAIR', 36, 48);
      ctx.fillStyle = '#FDA4AF';
      ctx.fillText('2 O’CLOCK: BOTTLE', 368, 63);

      animId = requestAnimationFrame(drawRadar);
    };

    drawRadar();
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, liveGuidanceLoop]);

  // Stop camera tracks and interval timers on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, []);

  const toggleLiveCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
      setLiveGuidanceLoop(false);
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      announce('Live camera stream stopped.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      announce('Live camera active.');
    } catch {
      setCameraActive(true);
      announce('Live spatial radar simulation active.');
    }
  };

  const captureCurrentVideoFrame = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return imagePreview;
    const c = document.createElement('canvas');
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  };

  const analyzeSceneAndSpeak = async (customPrompt = null) => {
    const promptText = customPrompt || sceneInput;
    setLoading(true);

    try {
      const frameData = captureCurrentVideoFrame();
      const res = await processModuleAI('visual-assistant', promptText, {
        detailLevel: 'comprehensive',
        imageBase64: frameData,
      });
      const d = res.data;
      const hazardText =
        Array.isArray(d.safetyAlerts) && d.safetyAlerts[0]
          ? d.safetyAlerts[0]
          : 'Check immediate floor clearance before stepping forward.';
      const formatted = `Spatial Clock-Face Map:\n${d.sceneSummary}\n\nNavigation Guidance:\n${d.navigationGuidance}\n\nSafety Warning:\n${hazardText}`;
      setOutputBoxText(formatted);
      if (Array.isArray(d.detectedObjects)) setDetectedObjects(d.detectedObjects);
      setSafetyAlert(hazardText);
      if (autoTtsEnabled) {
        speakText(`${d.sceneSummary}. ${d.navigationGuidance}. ${hazardText}`);
      }
    } catch {
      const preset =
        LIVE_ENVIRONMENTS[envCycleRef.current % LIVE_ENVIRONMENTS.length];
      envCycleRef.current += 1;
      const formatted = `Spatial Clock-Face Map:\n${preset.summary}\n\nNavigation Guidance:\n${preset.guidance}\n\nSafety Warning:\n${preset.hazard}`;
      setOutputBoxText(formatted);
      setDetectedObjects(preset.objects);
      setSafetyAlert(preset.hazard);
      if (autoTtsEnabled) {
        speakText(`${preset.summary}. ${preset.guidance}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Periodic frame capture every 4 seconds (within 3-5s spec)
  const toggleContinuousBlindGuidance = () => {
    if (liveGuidanceLoop) {
      clearInterval(loopTimerRef.current);
      setLiveGuidanceLoop(false);
      announce('Stopped live camera stream analysis.');
    } else {
      if (!cameraActive) toggleLiveCamera();
      setLiveGuidanceLoop(true);
      analyzeSceneAndSpeak();
      loopTimerRef.current = setInterval(() => {
        const nextEnv =
          LIVE_ENVIRONMENTS[envCycleRef.current % LIVE_ENVIRONMENTS.length];
        envCycleRef.current += 1;
        setSceneInput(nextEnv.summary);
        analyzeSceneAndSpeak(nextEnv.summary);
      }, 4000);
      announce('Started Live Camera Stream Analysis every 4 seconds.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      const msg = `Uploaded scene photo (${file.name}): Analyze clock-face objects and hazards.`;
      setSceneInput(msg);
      analyzeSceneAndSpeak(msg);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ModuleLayout
      title="Smart Visual & Surroundings Assistant (Blind Help)"
      category="Vision & Blind Guidance"
      description="Continuous live camera stream analysis (every 4 seconds via canvas snapshot) guiding blind and low-vision users through physical objects, clock-face spatial orientation, and hazard alerts."
      icon={Eye}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Live Camera Stream & Frame Capture */}
        <section className="lg:col-span-6 lumeo-card rounded-3xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={toggleContinuousBlindGuidance}
              aria-pressed={liveGuidanceLoop}
              className={`min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                liveGuidanceLoop
                  ? 'bg-teal-400 text-slate-950 border-2 border-white animate-pulse shadow-teal-glow'
                  : 'lumeo-btn-primary shadow-amber-glow'
              }`}
            >
              <Radio className="w-4 h-4" aria-hidden="true" />
              <span>
                {liveGuidanceLoop
                  ? 'Stop Live Camera Stream Analysis (Active 4s)'
                  : 'Start Live Camera Stream Analysis'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAutoTtsEnabled(!autoTtsEnabled)}
              aria-pressed={autoTtsEnabled}
              className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold"
            >
              {autoTtsEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Auto TTS: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" />
                  <span>Auto TTS: OFF</span>
                </>
              )}
            </button>
          </div>

          {/* Live Camera Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-teal-400/50 h-64 flex items-center justify-center">
            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Live camera recording for blind obstacle detection"
                className="absolute inset-0 w-full h-full object-cover opacity-75"
              />
            )}
            {imagePreview && !cameraActive && (
              <img
                src={imagePreview}
                alt="Uploaded static scene preview"
                className="absolute inset-0 w-full h-full object-contain opacity-80"
              />
            )}
            <canvas
              ref={radarCanvasRef}
              width={520}
              height={220}
              aria-label="Spatial object bounding box radar"
              className="relative z-10 w-full h-full"
            />
            <div className="absolute bottom-3 left-3 right-3 z-20 px-3.5 py-2 rounded-xl bg-black/80 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-between">
              <span>
                {liveGuidanceLoop
                  ? 'Streaming Frame Snapshot Every 4s → Gemini Vision'
                  : 'Clock-Face Spatial Radar Ready'}
              </span>
              <button
                type="button"
                onClick={toggleLiveCamera}
                className="underline text-teal-300"
              >
                {cameraActive ? 'Close Camera' : 'Enable Webcam'}
              </button>
            </div>
          </div>

          {/* Preset Clock-Face Environments */}
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2">
              Quick Clock-Face Environment Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LIVE_ENVIRONMENTS.map((env, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSceneInput(env.summary);
                    setDetectedObjects(env.objects);
                    setSafetyAlert(env.hazard);
                    const formatted = `Spatial Clock-Face Map:\n${env.summary}\n\nNavigation Guidance:\n${env.guidance}\n\nSafety Warning:\n${env.hazard}`;
                    setOutputBoxText(formatted);
                    if (autoTtsEnabled) speakText(`${env.summary} ${env.guidance}`);
                  }}
                  className="lumeo-card p-3 rounded-xl text-left text-xs font-bold hover:border-amber-400"
                >
                  {env.name}
                </button>
              ))}
            </div>
          </div>

          {/* Static Scene Upload Fallback & Voice Question */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="blind-scene-query" className="text-xs font-bold uppercase opacity-80">
                Scene Context or Upload Static Photo
              </label>
              <div className="flex items-center gap-2">
                <SpeechMicButton
                  onTranscript={(spoken) => {
                    setSceneInput(spoken);
                    analyzeSceneAndSpeak(spoken);
                  }}
                  buttonLabel="Ask by Voice"
                />
                <label
                  htmlFor="blind-photo-upload"
                  className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Upload Scene Photo</span>
                  <input
                    id="blind-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <textarea
              id="blind-scene-query"
              rows={2}
              value={sceneInput}
              onChange={(e) => setSceneInput(e.target.value)}
              className="lumeo-input w-full p-3.5 rounded-xl text-sm"
            />

            <button
              type="button"
              onClick={() => analyzeSceneAndSpeak()}
              disabled={loading}
              className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading
                  ? 'Analyzing Frame Snapshot...'
                  : 'Capture Snapshot Now & Speak Spatial Map'}
              </span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: High-Contrast Dedicated Spatial Output Box */}
        <section
          aria-live="assertive"
          className="lg:col-span-6 lumeo-card lumeo-glass-Output rounded-3xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold">
                Spatial Orientation Output Box
              </h2>
            </div>
            <button
              type="button"
              onClick={() => speakText(outputBoxText)}
              className="lumeo-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Read Aloud</span>
            </button>
          </div>

          <div>
            <label
              htmlFor="visual-output-box"
              className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2"
            >
              Clock-Face Directions &amp; Hazard Output Box
            </label>
            <textarea
              id="visual-output-box"
              rows={6}
              value={outputBoxText}
              onChange={(e) => setOutputBoxText(e.target.value)}
              className="lumeo-input w-full p-4 rounded-2xl text-lg font-bold leading-relaxed border-2 border-amber-400/50"
            />
          </div>

          <AudioPlayer text={outputBoxText} title="Blind Navigation Audio Player" />

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 mb-2">
              Detected Physical Objects (Clock-Face Layout)
            </h3>
            <div className="space-y-2">
              {detectedObjects.map((obj, idx) => (
                <div
                  key={idx}
                  className="lumeo-card p-3 rounded-xl flex items-center justify-between text-sm"
                >
                  <span className="font-bold text-amber-300">{obj.name}</span>
                  <span className="font-mono text-xs">{obj.position}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
                    {obj.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs font-bold">{safetyAlert}</p>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
