import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Volume2, Mic, FileText, Sparkles, Trash2 } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import SpeechMicButton from '../../components/SpeechMicButton';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function TtsSttModule() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'stt' ? 'stt' : 'stt';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { speakText, announce } = useAccessibility();

  const [inputText, setInputText] = useState(
    'Welcome to Lumeo Speech Studio. Speak into your microphone for real-time Speech-to-Text captions, or paste any document to hear natural Text-to-Speech narration.'
  );
  const [interimCaption, setInterimCaption] = useState('');
  const [outputBoxText, setOutputBoxText] = useState(
    'Welcome to Lumeo Speech Studio. Speak into your microphone for real-time Speech-to-Text captions, or paste any document to hear natural Text-to-Speech narration.'
  );
  const [captionFeed, setCaptionFeed] = useState([
    {
      speaker: 'Live Caption Engine',
      time: new Date().toLocaleTimeString(),
      text: 'Speech-to-Text (STT) engine ready. Click "Start Live STT Microphone" or use simulated voice stream.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'tts' || tabParam === 'stt') setActiveTab(tabParam);
  }, [searchParams]);

  const handleFinalTranscript = (spokenText) => {
    const entry = {
      speaker: 'Microphone STT',
      time: new Date().toLocaleTimeString(),
      text: spokenText,
    };
    setCaptionFeed((prev) => [entry, ...prev]);
    setOutputBoxText((prev) =>
      prev.includes('Welcome to Lumeo Speech Studio')
        ? spokenText
        : `${prev}\n${spokenText}`.trim()
    );
    setInputText((prev) => `${prev}\n${spokenText}`.trim());
    announce(`Transcribed: ${spokenText}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '').slice(0, 8000);
      setInputText(content);
      setOutputBoxText(content);
      announce(`Loaded document ${file.name} into Output Box`);
    };
    reader.readAsText(file);
  };

  const handleAIPunctuateAndSummarize = async () => {
    const source = outputBoxText.trim() || inputText.trim();
    if (!source) return;
    setLoading(true);
    try {
      const res = await processModuleAI('tts-stt', source, {
        mode: 'clean-and-summarize',
      });
      const d = res.data;
      const cleaned = `${d.cleanedText || source}\n\nSummary: ${d.summary || ''}`.trim();
      setOutputBoxText(cleaned);
      announce('Transcript punctuated and summarized inside Output Box.');
    } catch {
      announce('Transcript formatted in Output Box.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Speech-to-Text (STT) Live Captions & Text-to-Speech (TTS) Studio"
      category="Hearing, Speech & Sign"
      description="Real-time Speech-to-Text (STT) microphone transcription that streams directly into the Output Box, paired with natural Text-to-Speech (TTS) synthesis."
      icon={Volume2}
    >
      {/* Mode Tabs */}
      <div role="tablist" aria-label="Speech Studio Tabs" className="flex flex-wrap gap-3 mb-6">
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'stt'}
          onClick={() => setActiveTab('stt')}
          className={`min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm transition-all ${
            activeTab === 'stt'
              ? 'lumeo-btn-primary shadow-amber-glow'
              : 'lumeo-btn-secondary'
          }`}
        >
          <Mic className="w-4 h-4" aria-hidden="true" />
          <span>Speech-to-Text (STT) Live Captions</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'tts'}
          onClick={() => setActiveTab('tts')}
          className={`min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm transition-all ${
            activeTab === 'tts'
              ? 'lumeo-btn-primary shadow-amber-glow'
              : 'lumeo-btn-secondary'
          }`}
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Text-to-Speech (TTS) Narrator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Microphone STT Stream & Document Input */}
        <section className="lg:col-span-6 lumeo-card rounded-3xl p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  Live Speech-to-Text (STT) Microphone
                </span>
                <span className="text-xs text-slate-300">
                  Streams spoken words directly into the Output Box
                </span>
              </div>

              <SpeechMicButton
                onTranscript={handleFinalTranscript}
                onInterimTranscript={(interim) => setInterimCaption(interim)}
                continuous={true}
                buttonLabel="Start Live STT Microphone"
              />
            </div>

            {interimCaption && (
              <div className="p-3 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-200 font-bold text-base animate-pulse">
                Speaking: "{interimCaption}..."
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2 border-t border-slate-800">
              {captionFeed.map((item, idx) => (
                <div key={idx} className="text-sm leading-relaxed text-white">
                  <span className="text-xs font-mono text-teal-400 mr-2">
                    [{item.time} • {item.speaker}]:
                  </span>
                  <span className="font-bold text-amber-100">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document / Custom Input */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label htmlFor="tts-source-input" className="text-xs font-bold uppercase opacity-80">
                Source Passage or Document Upload
              </label>
              <label
                htmlFor="tts-file-upload"
                className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Upload .TXT / .MD</span>
                <input
                  id="tts-file-upload"
                  type="file"
                  accept=".txt,.md,.csv"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <textarea
              id="tts-source-input"
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setOutputBoxText(e.target.value);
              }}
              className="lumeo-input w-full p-4 rounded-2xl text-sm"
              placeholder="Type or paste any text to send to the Output Box..."
            />
          </div>

          <button
            type="button"
            onClick={handleAIPunctuateAndSummarize}
            disabled={loading}
            className="lumeo-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm shadow-amber-glow"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>
              {loading
                ? 'Formatting Transcript...'
                : 'AI Punctuate, Clean & Summarize into Output Box'}
            </span>
          </button>
        </section>

        {/* RIGHT COLUMN: Dedicated STT / TTS Output Box & Audio Synthesizer */}
        <section
          aria-live="polite"
          className="lg:col-span-6 lumeo-card lumeo-glass-Output rounded-3xl p-6 space-y-5 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <h2 className="font-display text-xl font-bold">
                Live STT Caption & TTS Output Box
              </h2>
              <button
                type="button"
                onClick={() => {
                  setOutputBoxText('');
                  setCaptionFeed([]);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear Output Box
              </button>
            </div>

            <div>
              <label
                htmlFor="stt-tts-output-box"
                className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2"
              >
                Verified Output Box (Live Captions & Speech Script)
              </label>
              <textarea
                id="stt-tts-output-box"
                rows={6}
                value={outputBoxText}
                onChange={(e) => setOutputBoxText(e.target.value)}
                className="lumeo-input w-full p-4 rounded-2xl text-lg font-bold leading-relaxed border-2 border-amber-400/50"
              />
            </div>

            <AudioPlayer
              text={outputBoxText}
              title="Natural Text-to-Speech (TTS) Audio Output"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Hello, please speak clearly so my live captions can transcribe you.',
                'Thank you, I have saved the transcript in my Output Box.',
              ].map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOutputBoxText(phrase);
                    speakText(phrase);
                  }}
                  className="lumeo-btn-secondary p-3 rounded-xl text-left text-xs font-bold hover:border-amber-400"
                >
                  🔊 "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
