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
  'Swahili',
];

export default function TranslatorModule() {
  const { announce } = useAccessibility();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [inputText, setInputText] = useState(
    'Hello, I use Lumeo assistive communication. Could you please show me the accessible step-free entrance?'
  );
  const [outputBoxText, setOutputBoxText] = useState(
    'Hola, utilizo la comunicación asistida de Lumeo. ¿Podría indicarme la entrada accesible sin escalones, por favor?\n\nPhonetics: OH-lah, oo-tee-LEE-soh lah koh-moo-nee-kah-SYOHN ah-sees-TEE-dah...'
  );
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('translator', inputText, {
        sourceLang,
        targetLang,
      });
      const d = res.data;
      const formatted = [
        d.translatedText,
        d.phoneticPronunciation ? `Phonetics: ${d.phoneticPronunciation}` : '',
        d.plainLanguageVersion ? `Plain Meaning: ${d.plainLanguageVersion}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      setOutputBoxText(formatted);
      announce(`Translated into ${targetLang} inside Output Box.`);
    } catch {
      announce('Translated into Output Box.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Multilingual Plain-Language Translator"
      category="Hearing, Speech & Sign"
      description="Translates text or spoken voice across global languages and places the translated text, phonetic pronunciation, and plain-language meaning inside the Output Box."
      icon={Languages}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-6 lumeo-card rounded-3xl p-6 space-y-5">
          <div className="grid grid-cols-5 items-end gap-3">
            <div className="col-span-2">
              <label htmlFor="src-lang" className="block text-xs font-bold uppercase text-amber-400 mb-1">
                From
              </label>
              <select
                id="src-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="lumeo-input w-full px-3 py-2.5 rounded-xl text-sm font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSourceLang(targetLang);
                  setTargetLang(sourceLang);
                }}
                aria-label="Swap languages"
                className="lumeo-btn-secondary w-11 h-11 rounded-xl flex items-center justify-center"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400" aria-hidden="true" />
              </button>
            </div>

            <div className="col-span-2">
              <label htmlFor="tgt-lang" className="block text-xs font-bold uppercase text-teal-400 mb-1">
                To
              </label>
              <select
                id="tgt-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="lumeo-input w-full px-3 py-2.5 rounded-xl text-sm font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="trans-input" className="text-xs font-bold uppercase opacity-80">
                  Source Message
                </label>
                <SpeechMicButton
                  onTranscript={(spoken) => setInputText(spoken)}
                  buttonLabel="Dictate"
                />
              </div>
              <textarea
                id="trans-input"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="lumeo-input w-full p-4 rounded-2xl text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm shadow-amber-glow"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Translating...' : `Translate to ${targetLang} Output Box`}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-6 lumeo-card lumeo-glass-Output rounded-3xl p-6 space-y-5"
        >
          <h2 className="font-display text-xl font-bold">
            Translated Output Box ({targetLang})
          </h2>

          <textarea
            aria-label="Translation output box"
            rows={6}
            value={outputBoxText}
            onChange={(e) => setOutputBoxText(e.target.value)}
            className="lumeo-input w-full p-4 rounded-2xl text-lg font-bold leading-relaxed border-2 border-amber-400/50"
          />

          <AudioPlayer
            text={outputBoxText.split('\n')[0]}
            title={`Speak ${targetLang} Translation`}
          />
        </section>
      </div>
    </ModuleLayout>
  );
}
