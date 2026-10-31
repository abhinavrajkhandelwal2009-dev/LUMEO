import React, { useState } from 'react';
import { Siren, Volume2, PhoneCall, AlertOctagon } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const QUICK_EMERGENCIES = [
  {
    label: 'Medical Assistance Needed',
    type: 'Medical Emergency',
    text: 'I am experiencing a medical emergency and have difficulty speaking. Please assist me and check my medical alert notes.',
  },
  {
    label: 'Lost / Disoriented in Transit',
    type: 'Navigation / Safety',
    text: 'I am disoriented and need safe assistance getting to the nearest accessible station entrance or information desk.',
  },
  {
    label: 'Sensory Overload / Quiet Space',
    type: 'Sensory / Autism / Neurodivergent Support',
    text: 'I am experiencing severe sensory overload and cannot speak right now. Please guide me to a quiet area and give me a few minutes.',
  },
  {
    label: 'Deaf / Non-Verbal First Responder Card',
    type: 'Deaf / Hard-of-Hearing Communication',
    text: 'I am Deaf / non-verbal. Please communicate with me by typing on this screen or showing written messages.',
  },
];

export default function EmergencyModule() {
  const { speakText, announce } = useAccessibility();
  const [emergencyType, setEmergencyType] = useState(QUICK_EMERGENCIES[0].type);
  const [situationText, setSituationText] = useState(QUICK_EMERGENCIES[0].text);
  const [medicalNotes, setMedicalNotes] = useState(
    'Uses assistive AAC communication. Please ask simple yes/no questions.'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectQuick = (item) => {
    setEmergencyType(item.type);
    setSituationText(item.text);
    speakText(item.text, 1.0);
    announce(`Selected ${item.label}`);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await processModuleAI('emergency', situationText, {
        emergencyType,
        medicalNotes,
      });
      setResult(res.data);
      speakText(res.data.firstResponderSpokenScript || situationText, 1.0);
      announce('Emergency communication card generated.');
    } catch {
      announce('Could not generate card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Emergency Communication Hub"
      category="Communication"
      description="Generates high-visibility, concise emergency messages, one-tap spoken alerts for first responders, and yes/no communication boards."
      icon={Siren}
    >
      {/* One-Tap Urgent Preset Buttons */}
      <section aria-label="One-Tap Emergency Presets" className="mb-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-700 hc-accent mb-3">
          One-Tap High-Visibility Emergency Cards (Speaks Immediately)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_EMERGENCIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuick(item)}
              className="p-4 rounded-2xl border-2 border-red-600 bg-red-50 hover:bg-red-100 text-left transition-colors hc-card focus:ring-4 focus:ring-blue-600"
            >
              <span className="flex items-center justify-between text-xs font-extrabold uppercase text-red-800 hc-accent mb-1">
                <span>{item.type}</span>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="block text-sm font-extrabold text-slate-950 hc-accent">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label
                htmlFor="emerg-situation"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1"
              >
                Current Urgent Situation
              </label>
              <textarea
                id="emerg-situation"
                rows={4}
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="emerg-medical"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1"
              >
                Medical / Accessibility Notes for Responder
              </label>
              <input
                id="emerg-medical"
                type="text"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-700 text-white font-extrabold hover:bg-red-800 focus:ring-4 focus:ring-blue-600"
            >
              <AlertOctagon className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading
                  ? 'Generating Responder Card...'
                  : 'Generate & Speak High-Visibility Alert Card'}
              </span>
            </button>
          </form>
        </section>

        {/* High-Visibility Responder Display */}
        <section
          aria-live="assertive"
          className="lg:col-span-7 rounded-2xl border-4 border-red-600 bg-slate-950 text-white p-6 shadow-lg space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-yellow-400 font-extrabold uppercase tracking-wider text-sm">
              <Siren className="w-6 h-6 animate-bounce" aria-hidden="true" />
              <span>Show This Screen to First Responder / Bystander</span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-700 text-white text-xs font-extrabold">
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              {result?.recommendedServiceNumber || '911 / 112 / 999'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-yellow-400 text-slate-950">
            <p className="text-2xl sm:text-3xl font-black leading-snug">
              {result?.urgentBannerText || situationText.toUpperCase()}
            </p>
          </div>

          <AudioPlayer
            text={result?.firstResponderSpokenScript || `${situationText}. ${medicalNotes}`}
            title="Play Loud Spoken Responder Message"
          />

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase text-yellow-300">
              One-Tap Spoken Responses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                result?.quickTapResponses || [
                  'YES - Please help me.',
                  'NO - Please wait a moment.',
                  'Please call emergency medical services.',
                  'Please write or type your question.',
                ]
              ).map((resp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => speakText(resp, 1.0)}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-yellow-400 text-left font-bold text-sm text-white flex items-center justify-between gap-2"
                >
                  <span>{resp}</span>
                  <Volume2 className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}

