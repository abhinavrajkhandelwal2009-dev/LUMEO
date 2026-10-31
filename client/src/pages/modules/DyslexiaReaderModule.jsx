import React, { useState } from 'react';
import { BookOpen, Sparkles, Sliders } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const OVERLAY_STYLES = {
  none: 'bg-white text-slate-900 border-slate-200',
  amber: 'bg-[#FEF3C7] text-slate-950 border-amber-300',
  blue: 'bg-[#E0F2FE] text-slate-950 border-sky-300',
  mint: 'bg-[#DCFCE7] text-slate-950 border-emerald-300',
  rose: 'bg-[#FFE4E6] text-slate-950 border-rose-300',
};

export default function DyslexiaReaderModule() {
  const { prefs, updatePreferences, announce } = useAccessibility();
  const [rawText, setRawText] = useState(
    'Cognitive load refers to the total amount of mental effort being utilized in the working memory during complex information acquisition. When instructional materials contain convoluted syntax and dense typographic blocks without adequate visual segmentation, individuals with dyslexia experience elevated visual crowding and phonological decoding fatigue.'
  );
  const [letterSpacing, setLetterSpacing] = useState(0.08);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [overlay, setOverlay] = useState('amber');
  const [focusRuler, setFocusRuler] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('dyslexia-reader', rawText);
      setResult(res.data);
      announce('Text simplified for dyslexia-friendly reading.');
    } catch {
      announce('Could not simplify text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Dyslexia Reading Assistant & Formatter"
      category="Reading & Education"
      description="Rewrites complex text into simplified bullet points with plain vocabulary, syllable breakdowns, OpenDyslexic font toggle, letter spacing, line height controls, and Irlen color overlays."
      icon={BookOpen}
    >
      {/* Dyslexia Visual Formatting Studio Controls */}
      <section
        aria-label="Dyslexia Typography & Color Overlay Controls"
        className="hc-card bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-blue-700 hc-accent" aria-hidden="true" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 hc-accent">
            Typography & Irlen Color Overlay Controls
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(prefs.dyslexiaFont)}
                onChange={(e) => updatePreferences({ dyslexiaFont: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-700"
              />
              <span className="text-sm font-bold text-slate-800 hc-accent">
                OpenDyslexic Font Active
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={focusRuler}
                onChange={(e) => setFocusRuler(e.target.checked)}
                className="w-5 h-5 rounded accent-blue-700"
              />
              <span className="text-sm font-bold text-slate-800 hc-accent">
                Highlight Reading Chunks
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="dyslexia-letter-spacing"
              className="block text-xs font-bold text-slate-700 hc-accent mb-1"
            >
              Letter Spacing ({letterSpacing}em)
            </label>
            <input
              id="dyslexia-letter-spacing"
              type="range"
              min="0"
              max="0.2"
              step="0.02"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full accent-blue-700"
            />
          </div>

          <div>
            <label
              htmlFor="dyslexia-line-height"
              className="block text-xs font-bold text-slate-700 hc-accent mb-1"
            >
              Line Height ({lineHeight})
            </label>
            <input
              id="dyslexia-line-height"
              type="range"
              min="1.4"
              max="2.6"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full accent-blue-700"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-700 hc-accent mb-1.5">
              Color Tint Overlay
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: 'none', label: 'White', bg: 'bg-white border-slate-400' },
                { id: 'amber', label: 'Warm Amber', bg: 'bg-[#FEF3C7] border-amber-500' },
                { id: 'blue', label: 'Soft Sky', bg: 'bg-[#E0F2FE] border-sky-500' },
                { id: 'mint', label: 'Calm Mint', bg: 'bg-[#DCFCE7] border-emerald-500' },
                { id: 'rose', label: 'Rose Tint', bg: 'bg-[#FFE4E6] border-rose-500' },
              ].map((tint) => (
                <button
                  key={tint.id}
                  type="button"
                  onClick={() => setOverlay(tint.id)}
                  aria-label={`Apply ${tint.label} color overlay`}
                  aria-pressed={overlay === tint.id}
                  className={`w-7 h-7 rounded-full border-2 ${tint.bg} ${
                    overlay === tint.id ? 'ring-4 ring-blue-600' : ''
                  }`}
                  title={tint.label}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSimplify} className="space-y-4">
            <div>
              <label
                htmlFor="dyslexia-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
              >
                Complex Article, Textbook, or Paragraph
              </label>
              <textarea
                id="dyslexia-input"
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="hc-input w-full p-4 rounded-xl border border-slate-300 text-sm"
                placeholder="Paste complex reading material here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>{loading ? 'Simplifying Text...' : 'Rewrite in Dyslexia-Friendly Format'}</span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          style={{
            letterSpacing: `${letterSpacing}em`,
            lineHeight: lineHeight,
          }}
          className={`lg:col-span-7 rounded-2xl border-2 p-6 shadow-sm space-y-5 dyslexia-text ${
            OVERLAY_STYLES[overlay] || OVERLAY_STYLES.none
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold">
              {result?.simplifiedTitle || 'Dyslexia-Friendly Reading Canvas'}
            </h2>
            {result?.readingLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/80 border border-slate-400">
                {result.readingLevel}
              </span>
            )}
          </div>

          <AudioPlayer
            text={
              result
                ? `${result.simplifiedTitle}. ${result.summary}. ${
                    Array.isArray(result.keyPoints) ? result.keyPoints.join('. ') : ''
                  }`
                : rawText
            }
            title="Read Simplified Passage Aloud"
          />

          {result ? (
            <div className="space-y-5">
              <div
                className={`p-4 rounded-xl bg-white/75 border border-slate-300 ${
                  focusRuler ? 'border-l-8 border-l-blue-700' : ''
                }`}
              >
                <span className="text-xs font-extrabold uppercase text-blue-800">
                  Plain Summary
                </span>
                <p className="font-bold mt-1">{result.summary}</p>
              </div>

              {Array.isArray(result.keyPoints) && (
                <div>
                  <h3 className="text-sm font-extrabold uppercase mb-2">
                    Digestible Bullet Points
                  </h3>
                  <ul className="space-y-2.5">
                    {result.keyPoints.map((pt, idx) => (
                      <li
                        key={idx}
                        className={`p-3.5 rounded-xl bg-white/80 border border-slate-300 font-semibold ${
                          focusRuler ? 'border-l-4 border-l-emerald-600' : ''
                        }`}
                      >
                        • {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(result.syllableBreakdowns) && (
                <div>
                  <h3 className="text-sm font-extrabold uppercase mb-2">
                    Syllable & Vocabulary Helper
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {result.syllableBreakdowns.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/85 border border-slate-300 text-xs"
                      >
                        <span className="block font-extrabold text-blue-800 text-sm">
                          {item.syllables || item.word}
                        </span>
                        <span className="block text-slate-700 mt-0.5">
                          Simple: <strong>{item.simpleSynonym}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="font-semibold">{rawText}</p>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

