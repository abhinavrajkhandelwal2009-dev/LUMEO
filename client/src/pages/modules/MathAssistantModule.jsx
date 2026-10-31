import React, { useState } from 'react';
import { Calculator, Upload, Sparkles } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function MathAssistantModule() {
  const { announce } = useAccessibility();
  const [problemInput, setProblemInput] = useState(
    'A community garden has 3 raised beds. Each bed holds 12 tomato plants. If 6 plants are already planted, how many more plants are needed to fill all 3 beds? Solve: (3 × 12) - 6'
  );
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      announce(`Loaded math problem image ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async (e) => {
    e.preventDefault();
    if (!problemInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('math-assistant', problemInput, {
        imageBase64,
        mimeType,
      });
      setResult(res.data);
      announce('Step-by-step visual math solution ready.');
    } catch {
      announce('Could not solve math problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Visual Mathematics & Dyscalculia Assistant"
      category="Vision & Surroundings"
      description="Extracts math word problems or equations from text or uploaded images and explains step-by-step solutions with concrete visual metaphors."
      icon={Calculator}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 hc-accent">
              Math Equation or Word Problem
            </span>
            <label
              htmlFor="math-img-upload"
              className="hc-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700 hc-accent" aria-hidden="true" />
              <span>Upload Math Photo</span>
              <input
                id="math-img-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
          </div>

          {imageBase64 && (
            <img
              src={imageBase64}
              alt="Uploaded math problem preview"
              className="max-h-40 rounded-xl border border-slate-300 mx-auto object-contain"
            />
          )}

          <form onSubmit={handleSolve} className="space-y-4">
            <textarea
              id="math-problem-input"
              aria-label="Math problem text or equation"
              rows={5}
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              className="hc-input w-full p-4 rounded-xl border border-slate-300 text-base font-medium"
              placeholder="Type a math word problem or equation (e.g., 2x + 5 = 17)..."
            />

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>{loading ? 'Solving Step-by-Step...' : 'Explain Math Solution Visually'}</span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Dyscalculia-Friendly Visual Breakdown
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Enter any word problem or equation (or upload a photo of a worksheet) to receive a visual block analogy and single-operation steps.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 hc-card">
                <span className="text-xs font-extrabold uppercase text-orange-900 hc-accent">
                  Final Answer
                </span>
                <p className="text-2xl font-black text-slate-900 hc-accent mt-1">
                  {result.finalAnswer}
                </p>
                {result.visualConceptMetaphor && (
                  <p className="text-xs font-semibold text-slate-700 hc-accent mt-2">
                    🧱 Visual Metaphor: {result.visualConceptMetaphor}
                  </p>
                )}
              </div>

              <AudioPlayer
                text={`Problem: ${result.extractedProblem}. Final answer: ${result.finalAnswer}. ${
                  Array.isArray(result.steps)
                    ? result.steps.map((s) => `Step ${s.stepNumber}: ${s.operationTitle}. ${s.plainExplanation}`).join('. ')
                    : ''
                }`}
                title="Listen to Spoken Math Walkthrough"
              />

              {Array.isArray(result.steps) && (
                <div className="space-y-3">
                  {result.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hc-card space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-blue-700 hc-accent">
                          Step {st.stepNumber || idx + 1}: {st.operationTitle}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900">
                        {st.equation}
                      </div>
                      <p className="text-sm text-slate-700 hc-accent font-medium">
                        {st.plainExplanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

