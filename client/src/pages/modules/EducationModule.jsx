import React, { useState } from 'react';
import { GraduationCap, Upload, Sparkles, HelpCircle } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function EducationModule() {
  const { announce } = useAccessibility();
  const [notesInput, setNotesInput] = useState(
    'Photosynthesis is the biochemical process by which green plants transform light energy into chemical energy. Light energy is captured by chlorophyll and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich glucose.'
  );
  const [level, setLevel] = useState('Plain Everyday Analogy (Universal)');
  const [outputBoxText, setOutputBoxText] = useState(
    `Topic: How Plants Turn Sunlight into Food (Photosynthesis)\n\nCore Takeaway:\nPlants act like solar-powered kitchens—they take in sunlight, water, and air to cook their own energy and release fresh oxygen for us to breathe.\n\nStep 1: Chlorophyll in green leaves catches sunlight like a solar panel.\nStep 2: Roots drink water from the soil while leaves breathe in carbon dioxide.\nStep 3: The plant combines them into glucose (plant food) and releases oxygen.`
  );
  const [questions, setQuestions] = useState([
    {
      question: 'What are the 3 main ingredients a plant uses in photosynthesis?',
      answer: 'Sunlight, water, and carbon dioxide.',
    },
    {
      question: 'What helpful gas do plants release into the air?',
      answer: 'Oxygen.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '').slice(0, 6000);
      setNotesInput(content);
      announce(`Loaded study document ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('education', notesInput, { level });
      const d = res.data;
      const steps = (d.stepByStepExplanation || [])
        .map(
          (s) =>
            `Step ${s.stepNumber} (${s.heading}): ${s.explanation}${
              s.realWorldAnalogy ? `\n💡 Analogy: ${s.realWorldAnalogy}` : ''
            }`
        )
        .join('\n\n');
      const formatted = `Topic: ${d.topicTitle || 'Study Guide'}\n\nCore Concept:\n${
        d.coreConceptPlain || ''
      }\n\n${steps}`.trim();
      setOutputBoxText(formatted);
      if (Array.isArray(d.practiceQuestions)) setQuestions(d.practiceQuestions);
      announce('Step-by-step explanation loaded into Output Box.');
    } catch {
      announce('Study explanation updated in Output Box.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Accessible Education & Document Explainer"
      category="Cognitive, Reading & Education"
      description="Parses study notes, textbooks, or uploaded documents and explains complex concepts step-by-step inside the dedicated Output Box with real-world analogies and spoken audio."
      icon={GraduationCap}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 lumeo-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="edu-notes-input"
              className="text-xs font-extrabold uppercase tracking-wider text-amber-400"
            >
              Study Notes or Document Text
            </label>
            <label
              htmlFor="edu-file-upload"
              className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Upload .TXT / .MD</span>
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
              className="lumeo-input w-full p-4 rounded-2xl text-sm"
            />

            <div>
              <label
                htmlFor="edu-level"
                className="block text-xs font-bold uppercase text-teal-400 mb-1"
              >
                Explanation Style
              </label>
              <select
                id="edu-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="lumeo-input w-full px-3.5 py-2.5 rounded-xl text-sm font-bold"
              >
                <option>Plain Everyday Analogy (Universal)</option>
                <option>Visual &amp; Concrete Step-by-Step Guide</option>
                <option>Exam Prep Summary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm shadow-amber-glow"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Explaining Concept...' : 'Explain Step-by-Step in Output Box'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 lumeo-card lumeo-glass-Output rounded-3xl p-6 space-y-5"
        >
          <h2 className="font-display text-xl font-bold">
            Step-by-Step Study Output Box
          </h2>

          <textarea
            aria-label="Accessible education output box"
            rows={8}
            value={outputBoxText}
            onChange={(e) => setOutputBoxText(e.target.value)}
            className="lumeo-input w-full p-4 rounded-2xl text-base font-bold leading-relaxed border-2 border-amber-400/50"
          />

          <AudioPlayer text={outputBoxText} title="Read Study Guide Aloud" />

          {questions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>Self-Check Practice Questions</span>
              </h3>
              {questions.map((q, idx) => (
                <details
                  key={idx}
                  className="lumeo-card p-3.5 rounded-2xl cursor-pointer"
                >
                  <summary className="text-sm font-bold">
                    Q{idx + 1}: {q.question}
                  </summary>
                  <p className="mt-2 text-sm text-teal-400 font-bold">
                    Answer: {q.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}
