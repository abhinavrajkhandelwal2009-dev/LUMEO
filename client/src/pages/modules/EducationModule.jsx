import React, { useState } from 'react';
import { GraduationCap, Upload, Sparkles, HelpCircle } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function EducationModule() {
  const { announce } = useAccessibility();
  const [notesInput, setNotesInput] = useState(
    'Photosynthesis is the biochemical process by which green plants and certain organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured by chlorophyll and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds (glucose).'
  );
  const [level, setLevel] = useState('Plain Everyday Analogy (Middle School / Universal)');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNotesInput(String(ev.target?.result || '').slice(0, 6000));
      announce(`Loaded study notes from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('education', notesInput, { level });
      setResult(res.data);
      announce('Step-by-step educational explanation ready.');
    } catch {
      announce('Could not process educational notes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Accessible Education & PDF/Notes Explainer"
      category="Reading & Education"
      description="Parses educational notes, textbook excerpts, or study documents and explains complex concepts step-by-step with real-world analogies and self-check questions."
      icon={GraduationCap}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="edu-notes-input"
              className="text-sm font-bold text-slate-800 hc-accent"
            >
              Paste Study Notes or Upload Document
            </label>
            <label
              htmlFor="edu-file-upload"
              className="hc-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700 hc-accent" aria-hidden="true" />
              <span>Upload Notes</span>
              <input
                id="edu-file-upload"
                type="file"
                accept=".txt,.md,.csv"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>

          <form onSubmit={handleExplain} className="space-y-4">
            <textarea
              id="edu-notes-input"
              rows={7}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="hc-input w-full p-4 rounded-xl border border-slate-300 text-sm"
              placeholder="Paste lecture notes, textbook paragraphs, or syllabus topics..."
            />

            <div>
              <label
                htmlFor="edu-level"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Explanation Style
              </label>
              <select
                id="edu-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option>Plain Everyday Analogy (Middle School / Universal)</option>
                <option>Visual & Concrete Step-by-Step Guide</option>
                <option>High School / College Exam Prep Summary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>{loading ? 'Breaking Down Concept...' : 'Explain Step-by-Step'}</span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            {result?.topicTitle || 'Step-by-Step Accessible Study Guide'}
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Paste your notes and click "Explain Step-by-Step" to generate a multi-sensory breakdown, real-world analogies, glossary, and self-check practice questions.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 hc-card">
                <span className="text-xs font-bold uppercase text-teal-900 hc-accent">
                  Core Takeaway in Plain Language
                </span>
                <p className="text-base font-bold text-slate-900 hc-accent mt-1">
                  {result.coreConceptPlain}
                </p>
              </div>

              <AudioPlayer
                text={`${result.topicTitle}. ${result.coreConceptPlain}`}
                title="Narrate Study Guide"
              />

              {Array.isArray(result.stepByStepExplanation) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent">
                    Step-by-Step Breakdown
                  </h3>
                  {result.stepByStepExplanation.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hc-card space-y-1.5"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-700 text-white">
                        Step {step.stepNumber || idx + 1}: {step.heading}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 hc-accent">
                        {step.explanation}
                      </p>
                      {step.realWorldAnalogy && (
                        <p className="text-xs text-blue-800 hc-accent font-medium bg-blue-50/70 p-2 rounded-lg">
                          💡 Real-World Analogy: {step.realWorldAnalogy}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(result.practiceQuestions) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Self-Check Review Questions</span>
                  </h3>
                  {result.practiceQuestions.map((q, idx) => (
                    <details
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 hc-card cursor-pointer"
                    >
                      <summary className="text-sm font-bold text-slate-900 hc-accent">
                        Q{idx + 1}: {q.question}
                      </summary>
                      <p className="mt-2 text-sm text-emerald-800 hc-accent font-semibold">
                        Answer: {q.answer}
                      </p>
                    </details>
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

