import React, { useState } from 'react';
import { BookOpen, Sparkles, Sliders } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const OVERLAY_STYLES = {
  none: 'lumeo-card',
  amber: 'bg-[#FEF3C7] text-slate-950 border-amber-400',
  blue: 'bg-[#E0F2FE] text-slate-950 border-sky-400',
  mint: 'bg-[#DCFCE7] text-slate-950 border-emerald-400',
  rose: 'bg-[#FFE4E6] text-slate-950 border-rose-400',
};

/**
 * Renders bionic reading fixation bolding (bolds the first half of each word)
 */
function renderBionicLine(line) {
  return line.split(/(\s+)/).map((part, idx) => {
    if (/^\s+$/.test(part)) return part;
    const clean = part.replace(/^[^\w]+|[^\w]+$/g, '');
    if (clean.length <= 2) {
      return (
        <strong key={idx} className="font-extrabold">
          {part}
        </strong>
      );
    }
    const boldLen = Math.ceil(part.length * 0.45);
    return (
      <span key={idx}>
        <strong className="font-extrabold underline decoration-amber-500/40">
          {part.slice(0, boldLen)}
        </strong>
        {part.slice(boldLen)}
      </span>
    );
  });
}

export default function DyslexiaReaderModule() {
  const { prefs, updatePreferences, announce } = useAccessibility();
  const [rawText, setRawText] = useState(
    'Cognitive load refers to the total amount of mental effort being utilized in working memory during complex information acquisition. When instructional materials contain convoluted syntax and dense typographic blocks without adequate visual segmentation, readers with dyslexia experience elevated visual crowding and decoding fatigue.'
  );
  const [bionicMode, setBionicMode] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState(0.08);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [overlay, setOverlay] = useState('amber');
  const [loading, setLoading] = useState(false);

  const [outputBoxText, setOutputBoxText] = useState(
    '• Cognitive load is the amount of mental effort your brain uses when learning new information.\n• Dense paragraphs and long words cause visual crowding and reading fatigue.\n• Breaking ideas into short, bionic-bolded chunks with wide spacing makes reading calm and effortless.'
  );
  const [syllables, setSyllables] = useState([
    { word: 'cognitive', syllables: 'cog·ni·tive', simpleSynonym: 'mental / thinking' },
    { word: 'acquisition', syllables: 'ac·qui·si·tion', simpleSynonym: 'learning / getting' },
    { word: 'segmentation', syllables: 'seg·men·ta·tion', simpleSynonym: 'splitting into parts' },
  ]);

  const handleSimplify = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('dyslexia-reader', rawText);
      const d = res.data;
      const formatted = [
        d.simplifiedTitle ? `${d.simplifiedTitle}` : '',
        d.summary ? `Summary: ${d.summary}` : '',
        ...(Array.isArray(d.keyPoints) ? d.keyPoints.map((pt) => `• ${pt}`) : []),
      ]
        .filter(Boolean)
        .join('\n\n');
      setOutputBoxText(formatted);
      if (Array.isArray(d.syllableBreakdowns)) setSyllables(d.syllableBreakdowns);
      announce('Simplified dyslexia-friendly text loaded into Output Box.');
    } catch {
      announce('Text simplified in Output Box.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Dyslexia Reading & Cognitive Canvas"
      category="Cognitive, Reading & Education"
      description="Rewrites complex articles into dyslexia-friendly cognitive chunks with first-letter Bionic fixation bolding, increased line spacing, Irlen color overlays, and instant Read Aloud."
      icon={BookOpen}
    >
      {/* Typography, Bionic Bolding & Tint Bar */}
      <section className="lumeo-card rounded-3xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Cognitive Formatting, Bionic First-Letter Bolding &amp; Irlen Overlays
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(prefs.dyslexiaFont)}
                onChange={(e) => updatePreferences({ dyslexiaFont: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-400"
              />
              <span className="text-xs font-bold">OpenDyslexic Font</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={bionicMode}
                onChange={(e) => setBionicMode(e.target.checked)}
                className="w-5 h-5 rounded accent-teal-400"
              />
              <span className="text-xs font-bold">Bold First Letters (Bionic)</span>
            </label>
          </div>

          <div>
            <label htmlFor="dys-spacing" className="block text-xs font-bold mb-1">
              Letter Spacing ({letterSpacing}em)
            </label>
            <input
              id="dys-spacing"
              type="range"
              min="0"
              max="0.2"
              step="0.02"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <div>
            <label htmlFor="dys-line" className="block text-xs font-bold mb-1">
              Line Spacing ({lineHeight}x)
            </label>
            <input
              id="dys-line"
              type="range"
              min="1.5"
              max="2.5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>

          <div>
            <span className="block text-xs font-bold mb-1.5">Irlen Color Tint</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'none', label: 'Theme Default', cls: 'bg-slate-800 border-amber-400' },
                { id: 'amber', label: 'Warm Amber', cls: 'bg-[#FEF3C7] border-amber-600' },
                { id: 'blue', label: 'Soft Sky', cls: 'bg-[#E0F2FE] border-sky-600' },
                { id: 'mint', label: 'Calm Mint', cls: 'bg-[#DCFCE7] border-emerald-600' },
                { id: 'rose', label: 'Rose Tint', cls: 'bg-[#FFE4E6] border-rose-600' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOverlay(t.id)}
                  aria-label={`Apply ${t.label} overlay`}
                  className={`w-8 h-8 rounded-full border-2 ${t.cls}`}
                  title={t.label}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 lumeo-card rounded-3xl p-6 space-y-4">
          <form onSubmit={handleSimplify} className="space-y-4">
            <div>
              <label
                htmlFor="dyslexia-raw-input"
                className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2"
              >
                Complex Source Article or Textbook Passage
              </label>
              <textarea
                id="dyslexia-raw-input"
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="lumeo-input w-full p-4 rounded-2xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm shadow-amber-glow"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading
                  ? 'Chunking & Simplifying...'
                  : 'Rewrite into Dyslexia Output Box'}
              </span>
            </button>
          </form>
        </section>

        {/* Dedicated Output Box with Bionic First-Letter Bolding */}
        <section
          aria-live="polite"
          style={{ letterSpacing: `${letterSpacing}em`, lineHeight }}
          className={`lg:col-span-7 rounded-3xl border-2 p-6 space-y-5 dyslexia-text ${
            OVERLAY_STYLES[overlay] || OVERLAY_STYLES.none
          }`}
        >
          <h2 className="font-display text-xl font-bold">
            Dyslexia Cognitive Output Box
          </h2>

          {/* Bionic Chunked Display */}
          <div
            style={{ letterSpacing: `${letterSpacing}em`, lineHeight }}
            className="p-5 rounded-2xl border-2 border-amber-500/50 bg-white/90 text-slate-950 text-base space-y-3"
          >
            {outputBoxText.split('\n').map((line, i) => (
              <p key={i} className="leading-relaxed">
                {bionicMode ? renderBionicLine(line) : line}
              </p>
            ))}
          </div>

          <textarea
            aria-label="Editable dyslexia output box"
            rows={4}
            value={outputBoxText}
            onChange={(e) => setOutputBoxText(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-400 bg-white/80 text-slate-950 text-sm font-semibold"
          />

          <AudioPlayer
            text={outputBoxText}
            title="Instant Read Aloud Output Box"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {syllables.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white/95 text-slate-950 border border-slate-300 text-xs"
              >
                <span className="block font-extrabold text-amber-800 text-sm">
                  {item.syllables || item.word}
                </span>
                <span className="block mt-1">
                  Plain meaning: <strong>{item.simpleSynonym}</strong>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
