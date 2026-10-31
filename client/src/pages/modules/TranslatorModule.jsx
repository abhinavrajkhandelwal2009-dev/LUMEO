import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Sparkles } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import SpeechMicButton from '../../components/SpeechMicButton';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Mandarin Chinese',
  'Arabic',
  'Portuguese',
  'Japanese',
  'Korean',
  'Italian',
  'Swahili',
];

export default function TranslatorModule() {
  const { prefs, announce } = useAccessibility();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState(
    prefs.defaultLanguage && prefs.defaultLanguage !== 'English'
      ? prefs.defaultLanguage
      : 'Spanish'
  );
  const [inputText, setInputText] = useState(
    'Hello, I use an assistive communication app. Could you please show me the accessible step-free entrance and speak slowly?'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    announce(`Swapped languages to ${targetLang} and ${sourceLang}`);
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('translator', inputText, {
        sourceLang,
        targetLang,
      });
      setResult(res.data);
      announce(`Translated into ${targetLang}`);
    } catch {
      announce('Translation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Multilingual AI Translation Suite"
      category="Communication"
      description="Translates text or extracted document content across global languages with plain-language adaptations, phonetic guides, and cultural context."
      icon={Languages}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 items-end gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="source-lang"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                From Language
              </label>
              <select
                id="source-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="hc-input w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swapLanguages}
                aria-label="Swap source and target languages"
                className="hc-card p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100"
              >
                <ArrowRightLeft className="w-4 h-4 text-blue-700 hc-accent" aria-hidden="true" />
              </button>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="target-lang"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                To Language
              </label>
              <select
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="hc-input w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="translator-input"
                  className="text-sm font-bold text-slate-800 hc-accent"
                >
                  Source Text or Document Passage
                </label>
                <SpeechMicButton
                  onTranscript={(t) => setInputText((prev) => `${prev} ${t}`.trim())}
                  buttonLabel="Dictate"
                />
              </div>
              <textarea
                id="translator-input"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="hc-input w-full p-4 rounded-xl border border-slate-300 text-base"
                placeholder="Enter text to translate..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Translating...' : `Translate to ${targetLang} with Plain-Language Guide`}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Accessible Translation & Phonetics
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Select your target language and click Translate to receive the translation, phonetic pronunciation guide, and plain-language breakdown.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 hc-card">
                <span className="text-xs font-bold uppercase text-cyan-900 hc-accent">
                  {result.targetLanguage} Translation
                </span>
                <p className="text-xl font-extrabold text-slate-900 hc-accent mt-1">
                  {result.translatedText}
                </p>
                {result.phoneticPronunciation && (
                  <p className="text-xs font-mono text-slate-600 hc-accent mt-2">
                    Phonetics: {result.phoneticPronunciation}
                  </p>
                )}
              </div>

              <AudioPlayer
                text={result.translatedText}
                title={`Listen to ${result.targetLanguage} Translation`}
              />

              {result.plainLanguageVersion && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hc-card">
                  <span className="text-xs font-bold uppercase text-slate-500 hc-accent">
                    Simplified Plain-Language Meaning
                  </span>
                  <p className="text-sm font-semibold text-slate-800 hc-accent mt-1">
                    {result.plainLanguageVersion}
                  </p>
                </div>
              )}

              {Array.isArray(result.keyVocabulary) && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 hc-accent mb-2">
                    Key Vocabulary Breakdown
                  </h3>
                  <div className="space-y-2">
                    {result.keyVocabulary.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-slate-200 hc-card text-xs flex flex-wrap items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-900 hc-accent">
                          {item.term} → {item.translation}
                        </span>
                        <span className="text-slate-600 hc-accent">{item.meaning}</span>
                      </div>
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

