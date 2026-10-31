import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Volume2, Mic, FileText, Sparkles } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import SpeechMicButton from '../../components/SpeechMicButton';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function TtsSttModule() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'stt' ? 'stt' : 'tts';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { announce } = useAccessibility();
  const [textInput, setTextInput] = useState(
    'Welcome to LUMEO Live Caption & Speech Studio. Paste any document or use your microphone to generate real-time accessible captions and natural audio playback.'
  );
  const [liveTranscripts, setLiveTranscripts] = useState([
    { speaker: 'Speaker 1', time: 'Just now', text: 'Hello everyone, let us make sure live captions are active on screen.' },
  ]);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'stt') setActiveTab('stt');
  }, [searchParams]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setTextInput(content.slice(0, 8000));
      announce(`Loaded text document ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAppendTranscript = (spokenChunk) => {
    const entry = {
      speaker: 'Live Mic',
      time: new Date().toLocaleTimeString(),
      text: spokenChunk,
    };
    setLiveTranscripts((prev) => [...prev, entry]);
    setTextInput((prev) => `${prev}\n${spokenChunk}`.trim());
  };

  const handleProcessAI = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('tts-stt', textInput, {
        mode: activeTab === 'stt' ? 'caption-cleanup' : 'tts-narration',
      });
      setAiResult(res.data);
      announce('Processed transcript and narration structure.');
    } catch {
      announce('Error processing transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Text-to-Speech (TTS) & Speech-to-Text (STT) Live Caption Studio"
      category="Communication & Reading"
      description="Converts any text block or uploaded document into natural-sounding audio with speed/pitch controls, and transcribes spoken audio into real-time high-contrast captions."
      icon={Volume2}
    >
      {/* Mode Switcher */}
      <div role="tablist" aria-label="Speech Studio Mode" className="flex gap-3 mb-6">
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'tts'}
          onClick={() => setActiveTab('tts')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
            activeTab === 'tts'
              ? 'bg-blue-700 text-white border-blue-700 hc-button-primary'
              : 'bg-white text-slate-800 border-slate-300 hc-card'
          }`}
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Text-to-Speech (TTS) Reader</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'stt'}
          onClick={() => setActiveTab('stt')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
            activeTab === 'stt'
              ? 'bg-blue-700 text-white border-blue-700 hc-button-primary'
              : 'bg-white text-slate-800 border-slate-300 hc-card'
          }`}
        >
          <Mic className="w-4 h-4" aria-hidden="true" />
          <span>Speech-to-Text (STT) Live Captions</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          {activeTab === 'stt' && (
            <div className="p-5 rounded-2xl bg-slate-950 text-yellow-300 border-2 border-yellow-400 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Live High-Contrast Caption Display
                </span>
                <SpeechMicButton
                  onTranscript={handleAppendTranscript}
                  continuous={true}
                  buttonLabel="Start Real-Time Captioning"
                />
              </div>
              <div
                aria-live="polite"
                className="space-y-2 max-h-52 overflow-y-auto pt-2 border-t border-slate-800"
              >
                {liveTranscripts.map((item, idx) => (
                  <div key={idx} className="text-base font-bold leading-relaxed">
                    <span className="text-xs font-mono text-sky-300 mr-2">
                      [{item.time} • {item.speaker}]:
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="tts-stt-textarea"
                className="text-sm font-bold text-slate-800 hc-accent"
              >
                Document Text / Spoken Transcript Buffer
              </label>
              <label
                htmlFor="tts-doc-upload"
                className="hc-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700 hc-accent" aria-hidden="true" />
                <span>Upload .TXT / .MD Document</span>
                <input
                  id="tts-doc-upload"
                  type="file"
                  accept=".txt,.md,.csv"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <textarea
              id="tts-stt-textarea"
              rows={6}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="hc-input w-full p-4 rounded-xl border border-slate-300 text-base leading-relaxed"
              placeholder="Type, paste document text, or dictate with the microphone..."
            />
          </div>

          <AudioPlayer text={textInput} title="Direct Web Speech API Synthesizer" />

          <button
            type="button"
            onClick={handleProcessAI}
            disabled={loading}
            className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>
              {loading
                ? 'Enhancing & Summarizing Transcript...'
                : 'AI Punctuate, Summarize & Format Passages'}
            </span>
          </button>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            AI Speech & Caption Enhancements
          </h2>

          {!aiResult ? (
            <p className="text-sm text-slate-600 hc-accent">
              Click "AI Punctuate, Summarize & Format Passages" to structure raw captions into punctuated sentences, extract key terms, and estimate speaking duration.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 hc-card">
                <span className="text-xs font-bold uppercase text-indigo-800 hc-accent">
                  Executive Summary ({aiResult.estimatedDurationSeconds}s speaking time)
                </span>
                <p className="text-sm font-bold text-slate-900 hc-accent mt-1">
                  {aiResult.summary}
                </p>
              </div>

              <AudioPlayer text={aiResult.cleanedText || aiResult.summary} title="Narrate AI Cleaned Passages" />

              {Array.isArray(aiResult.ssmlFormattedPassages) && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 hc-accent mb-2">
                    Segmented Reading Blocks
                  </h3>
                  <div className="space-y-2">
                    {aiResult.ssmlFormattedPassages.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hc-card text-sm"
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(aiResult.keyTerms) && (
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"
                    >
                      {term}
                    </span>
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

