import React, { useState } from 'react';
import { HeartHandshake, Sparkles, Wind } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function MentalHealthModule() {
  const { announce } = useAccessibility();
  const [inputText, setInputText] = useState(
    'Acute stress response and generalized sensory overwhelm can trigger autonomic hyperarousal, making executive decision-making and reading dense instructions feel exhausting. Practicing paced diaphragmatic breathing and sensory grounding helps regulate nervous system activity.'
  );
  const [tone, setTone] = useState('Calm, reassuring, and low cognitive load');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('mental-health', inputText, { tone });
      setResult(res.data);
      announce('Gentle wellbeing summary and grounding steps ready.');
    } catch {
      announce('Could not process wellbeing text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Mental Health & Wellbeing Information Simplifier"
      category="Reading & Education"
      description="Explains general wellbeing and mental health guides in gentle, clear, comforting language with low cognitive load and step-by-step sensory grounding."
      icon={HeartHandshake}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSimplify} className="space-y-4">
            <div>
              <label
                htmlFor="mh-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
              >
                Wellbeing Article, Care Guide, or Clinical Note to Simplify
              </label>
              <textarea
                id="mh-input"
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="hc-input w-full p-4 rounded-xl border border-slate-300 text-sm"
                placeholder="Paste any overwhelming health or wellbeing information..."
              />
            </div>

            <div>
              <label
                htmlFor="mh-tone"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Preferred Support Tone
              </label>
              <select
                id="mh-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option>Calm, reassuring, and low cognitive load</option>
                <option>Ultra-brief bullet points (Minimal reading effort)</option>
                <option>Action-focused self-care steps</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Preparing Gentle Summary...' : 'Explain Gently & Comfortingly'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Gentle, Low-Stress Guide & Grounding Exercise
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Paste any dense mental health or self-care guide to receive a comforting summary, plain explanation, and a guided sensory grounding exercise.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 hc-card">
                <p className="text-base font-extrabold text-slate-900 hc-accent">
                  {result.gentleSummary}
                </p>
                <p className="text-sm text-slate-700 hc-accent mt-1">
                  {result.reassuringValidation}
                </p>
              </div>

              <AudioPlayer
                text={`${result.gentleSummary}. ${result.reassuringValidation}. ${
                  Array.isArray(result.plainExplanation) ? result.plainExplanation.join('. ') : ''
                }`}
                title="Listen to Calm Audio Narration"
              />

              {Array.isArray(result.plainExplanation) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-500 hc-accent">
                    What This Means in Plain Words
                  </h3>
                  {result.plainExplanation.map((line, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hc-card text-sm font-medium"
                    >
                      • {line}
                    </div>
                  ))}
                </div>
              )}

              {result.groundingExercise && (
                <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 hc-card space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-900 hc-accent font-extrabold text-sm">
                    <Wind className="w-5 h-5" aria-hidden="true" />
                    <span>{result.groundingExercise.title}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-800 hc-accent font-medium">
                    {(result.groundingExercise.steps || []).map((st, idx) => (
                      <li key={idx}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}

              {result.supportResourcesNote && (
                <p className="text-xs font-semibold text-slate-600 hc-accent p-3 rounded-xl border border-slate-200">
                  {result.supportResourcesNote}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

