import React, { useState } from 'react';
import { Siren, Volume2, PhoneCall, AlertOctagon, Maximize2, Minimize2 } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const QUICK_EMERGENCIES = [
  {
    label: 'Medical Assistance Needed',
    type: 'Medical Emergency',
    text: 'I am experiencing a medical emergency and have difficulty speaking. Please assist me and check my medical notes.',
  },
  {
    label: 'Blind / Disoriented in Transit',
    type: 'Wayfinding Assistance',
    text: 'I am blind/low-vision and disoriented. Please guide me verbally to the nearest safe information desk or station exit.',
  },
  {
    label: 'Sensory Overload / Quiet Space',
    type: 'Neurodivergent Support',
    text: 'I am experiencing severe sensory overload and cannot speak right now. Please guide me to a quiet area and give me a moment.',
  },
  {
    label: 'Deaf / Non-Verbal Responder Card',
    type: 'Deaf / AAC Communication',
    text: 'I am Deaf / non-verbal. Please communicate with me by typing or writing clearly.',
  },
];

export default function EmergencyModule() {
  const { speakText, announce } = useAccessibility();
  const [situationText, setSituationText] = useState(QUICK_EMERGENCIES[0].text);
  const [medicalNotes, setMedicalNotes] = useState(
    'Uses Lumeo assistive AAC communication. Please ask simple yes/no questions.'
  );
  const [outputBoxText, setOutputBoxText] = useState(
    `URGENT FIRST RESPONDER ALERT (911 / 112 / 999):\n${QUICK_EMERGENCIES[0].text}\n\nMedical Context: Uses Lumeo assistive AAC communication. Please ask simple yes/no questions.`
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (item) => {
    setSituationText(item.text);
    const formatted = `URGENT (${item.type.toUpperCase()} - 911 / 112 / 999):\n${item.text}\n\nNotes: ${medicalNotes}`;
    setOutputBoxText(formatted);
    speakText(`${item.text}. ${medicalNotes}`, 1.0);
    announce(`Activated ${item.label}`);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await processModuleAI('emergency', situationText, {
        medicalNotes,
      });
      const d = res.data;
      const formatted = `${d.urgentBannerText || situationText.toUpperCase()}\n\nSpoken Responder Script: ${
        d.firstResponderSpokenScript || situationText
      }`;
      setOutputBoxText(formatted);
      speakText(d.firstResponderSpokenScript || situationText, 1.0);
    } catch {
      speakText(outputBoxText, 1.0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Emergency SOS & First Responder Hub"
      category="Emergency & Global"
      description="Quick-action medical and speech emergency card generator with high-visibility fullscreen mode (911 / 112 / 999) and automated loud spoken responder audio messages."
      icon={Siren}
    >
      {/* Fullscreen Responder Overlay */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen Emergency First Responder Card"
          className="fixed inset-0 z-50 bg-black text-white p-6 sm:p-12 flex flex-col justify-between overflow-y-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-rose-500 pb-4">
            <div className="flex items-center gap-3 text-amber-400 font-black text-xl uppercase">
              <Siren className="w-8 h-8 animate-bounce text-rose-500" aria-hidden="true" />
              <span>EMERGENCY FIRST RESPONDER CARD • 911 / 112 / 999</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-extrabold text-sm"
            >
              <Minimize2 className="w-5 h-5" aria-hidden="true" />
              <span>Exit Fullscreen</span>
            </button>
          </div>

          <div className="my-8 p-8 rounded-3xl bg-amber-400 text-slate-950 font-black text-2xl sm:text-4xl leading-snug whitespace-pre-line">
            {outputBoxText}
          </div>

          <div className="space-y-4">
            <AudioPlayer text={outputBoxText} title="Loud Responder Audio Broadcast" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'YES — Please call emergency medical services (911 / 112 / 999).',
                'NO — I am safe, I just need a moment to communicate.',
              ].map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => speakText(r, 1.0)}
                  className="p-5 rounded-2xl border-2 border-amber-400 bg-slate-900 text-white font-extrabold text-lg text-left flex items-center justify-between"
                >
                  <span>{r}</span>
                  <Volume2 className="w-6 h-6 text-amber-400 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section aria-label="One-Tap Emergency Cards" className="mb-8">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 mb-3">
          One-Tap Urgent Broadcast Cards (Updates Output Box &amp; Speaks Immediately)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {QUICK_EMERGENCIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className="lumeo-card p-4 rounded-2xl border-2 border-rose-500/60 hover:bg-rose-500/15 text-left transition-all"
            >
              <span className="flex items-center justify-between text-xs font-extrabold uppercase text-rose-400 mb-1">
                <span>{item.type}</span>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="block font-display text-base font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 lumeo-card rounded-3xl p-6 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="sos-situation" className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Emergency Situation Details
              </label>
              <textarea
                id="sos-situation"
                rows={4}
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                className="lumeo-input w-full p-3.5 rounded-2xl text-sm font-bold"
              />
            </div>

            <div>
              <label htmlFor="sos-notes" className="block text-xs font-bold uppercase text-teal-400 mb-1">
                Medical / Accessibility Notes
              </label>
              <input
                id="sos-notes"
                type="text"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="lumeo-input w-full px-4 py-2.5 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg"
            >
              <AlertOctagon className="w-5 h-5" aria-hidden="true" />
              <span>Generate &amp; Speak Loud Responder Alert</span>
            </button>
          </form>
        </section>

        <section
          aria-live="assertive"
          className="lg:col-span-7 rounded-3xl border-4 border-rose-500 bg-slate-950 text-white p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              High-Visibility Responder Output Box
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold">
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                911 / 112 / 999
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fullscreen Card</span>
              </button>
            </div>
          </div>

          <textarea
            aria-label="Emergency responder output box"
            rows={5}
            value={outputBoxText}
            onChange={(e) => setOutputBoxText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl leading-snug"
          />

          <AudioPlayer text={outputBoxText} title="Loud First-Responder Voice Broadcast" />
        </section>
      </div>
    </ModuleLayout>
  );
}
