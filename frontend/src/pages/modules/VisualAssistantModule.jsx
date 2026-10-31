import React, { useState } from 'react';
import { Eye, Upload, Compass, AlertTriangle, Sparkles } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import SpeechMicButton from '../../components/SpeechMicButton';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const PRESET_SCENES = [
  'Hospital reception lobby with automatic sliding glass doors ahead, check-in kiosk at 10 o\'clock, and tactile floor tiles.',
  'Crosswalk intersection with pedestrian push-button on a pole to the right, curb ramp ahead, and coffee shop entrance on the left.',
  'Medication bottle label: Amoxicillin 500mg, take one capsule by mouth every 8 hours with water.',
];

export default function VisualAssistantModule() {
  const { announce } = useAccessibility();
  const [sceneInput, setSceneInput] = useState(PRESET_SCENES[0]);
  const [detailLevel, setDetailLevel] = useState('comprehensive');
  const [imagePreview, setImagePreview] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      if (!sceneInput.trim()) {
        setSceneInput(`Uploaded image: ${file.name}. Describe surroundings, objects, and visible text.`);
      }
      announce(`Loaded image ${file.name} for visual analysis.`);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sceneInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('visual-assistant', sceneInput, {
        detailLevel,
        imageBase64: imagePreview,
        mimeType,
      });
      setResult(res.data);
      announce('Visual scene description ready.');
    } catch {
      announce('Could not analyze scene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Smart Visual Assistant & Object Identifier"
      category="Vision & Surroundings"
      description="Analyzes uploaded images or camera frames to describe spatial surroundings (clock-face orientation), identify objects, read signs, and flag safety hazards."
      icon={Eye}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <label
              htmlFor="visual-file-upload"
              className="block text-sm font-bold text-slate-800 hc-accent mb-2"
            >
              Upload Scene Photo or Document Frame (Optional)
            </label>
            <label
              htmlFor="visual-file-upload"
              className="hc-card flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="w-7 h-7 text-blue-700 hc-accent mb-2" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-800 hc-accent">
                Choose Image File (PNG, JPG, WebP)
              </span>
              <span className="text-xs text-slate-500 hc-accent mt-1">
                Sent securely to backend Gemini Vision analyzer
              </span>
              <input
                id="visual-file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>

            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Uploaded visual scene preview"
                  className="max-h-48 rounded-xl border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
              Quick Sample Environments
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SCENES.map((scene, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSceneInput(scene)}
                  className="hc-card text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100"
                >
                  Sample Scene #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="visual-scene-input"
                  className="text-sm font-bold text-slate-800 hc-accent"
                >
                  Scene Context or Specific Question
                </label>
                <SpeechMicButton
                  onTranscript={(t) => setSceneInput((prev) => `${prev} ${t}`.trim())}
                  buttonLabel="Ask by Voice"
                />
              </div>
              <textarea
                id="visual-scene-input"
                rows={4}
                value={sceneInput}
                onChange={(e) => setSceneInput(e.target.value)}
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm"
                placeholder="Describe what you are pointing your camera at or ask a question about the uploaded image..."
              />
            </div>

            <div>
              <label
                htmlFor="visual-detail-level"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Description Depth
              </label>
              <select
                id="visual-detail-level"
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option value="comprehensive">Comprehensive Spatial & Clock-Face Layout</option>
                <option value="quick-navigation">Quick Obstacle & Navigation Check</option>
                <option value="ocr-text">Focus on Reading Printed Text / Signs</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>{loading ? 'Analyzing Surroundings...' : 'Describe Surroundings & Objects'}</span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Spatial Audio Description & Object Map
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Upload an image or select a scene to receive a structured clock-face spatial description, detected object list, OCR text extraction, and safety alerts.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 hc-card">
                <h3 className="text-xs font-bold uppercase text-emerald-800 hc-accent">
                  Scene Summary
                </h3>
                <p className="text-base font-bold text-slate-900 hc-accent mt-1">
                  {result.sceneSummary}
                </p>
              </div>

              <AudioPlayer
                text={`${result.sceneSummary}. Navigation guidance: ${result.navigationGuidance}`}
                title="Narrate Visual Scene"
              />

              {result.spatialLayout && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.spatialLayout).map(([zone, desc]) => (
                    <div
                      key={zone}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hc-card"
                    >
                      <span className="text-xs font-extrabold uppercase text-blue-700 hc-accent">
                        {zone}
                      </span>
                      <p className="text-xs text-slate-700 hc-accent mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(result.detectedObjects) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Identified Objects & Clock Orientation
                  </h3>
                  <div className="space-y-2">
                    {result.detectedObjects.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hc-card text-xs"
                      >
                        <span className="font-bold text-slate-900 hc-accent">{obj.name}</span>
                        <span className="text-slate-600 hc-accent">{obj.position}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          {obj.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(result.safetyAlerts) && result.safetyAlerts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 hc-card">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase mb-1">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <span>Safety & Mobility Notes</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-950 hc-accent space-y-1">
                    {result.safetyAlerts.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.navigationGuidance && (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 hc-card text-xs font-semibold text-blue-950 hc-accent">
                  <Compass className="w-4 h-4 shrink-0 mt-0.5 text-blue-700" aria-hidden="true" />
                  <span>{result.navigationGuidance}</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

