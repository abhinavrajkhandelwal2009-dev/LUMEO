import React, { useState } from 'react';
import { Bus, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function TransportModule() {
  const { announce } = useAccessibility();
  const [origin, setOrigin] = useState('Central Station (Main Concourse)');
  const [destination, setDestination] = useState('City General Hospital Medical Plaza');
  const [mobilityNeed, setMobilityNeed] = useState(
    'Step-Free Wheelchair Access + Audio Announcements'
  );
  const [scheduleInput, setScheduleInput] = useState(
    'Line 4 Blue Metro departs every 10 mins from Platform B (North). Elevator E2 connects Main Concourse to Platform B. Low-floor Bus 18 departs Bay 3 directly to Hospital East Entrance.'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await processModuleAI('transport', scheduleInput, {
        origin,
        destination,
        mobilityNeed,
      });
      setResult(res.data);
      announce('Accessible step-by-step transit route ready.');
    } catch {
      announce('Could not process transit route.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Public Transport & Step-Free Navigation Assistant"
      category="Navigation & Employment"
      description="Interprets transit schedules, maps, and station notices into clear, actionable, step-by-step accessible guidance with elevator, tactile, and audio cues."
      icon={Bus}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handlePlanRoute} className="space-y-4">
            <div>
              <label
                htmlFor="trans-origin"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Starting Station / Location
              </label>
              <input
                id="trans-origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="trans-dest"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Destination
              </label>
              <input
                id="trans-dest"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="trans-mobility"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Accessibility & Mobility Requirement
              </label>
              <select
                id="trans-mobility"
                value={mobilityNeed}
                onChange={(e) => setMobilityNeed(e.target.value)}
                className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option>Step-Free Wheelchair Access + Audio Announcements</option>
                <option>Blind / Low-Vision Tactile & Audible Wayfinding</option>
                <option>Sensory-Friendly Low-Crowd Transfer</option>
                <option>Deaf / Visual Next-Stop Display Priority</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="trans-schedule"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Schedule / Notice / Station Info
              </label>
              <textarea
                id="trans-schedule"
                rows={4}
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Building Step-Free Route...' : 'Generate Step-by-Step Transit Guide'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Accessible Wayfinding & Transfer Instructions
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Enter your origin, destination, and transit notice to generate step-free navigation steps with landmark and elevator verification.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 hc-card flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase text-sky-900 hc-accent">
                    {result.accessibilityRating}
                  </span>
                  <p className="text-base font-extrabold text-slate-900 hc-accent">
                    {result.routeSummary}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-extrabold">
                  {result.estimatedDuration}
                </span>
              </div>

              <AudioPlayer
                text={`${result.routeSummary}. ${
                  Array.isArray(result.stepByStepDirections)
                    ? result.stepByStepDirections.map((d) => `Step ${d.step}: ${d.instruction}`).join('. ')
                    : ''
                }`}
                title="Listen to Spoken Wayfinding Guide"
              />

              {Array.isArray(result.stepByStepDirections) && (
                <div className="space-y-3">
                  {result.stepByStepDirections.map((step, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hc-card space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                          {step.step || i + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-900 hc-accent">
                          {step.instruction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 hc-accent flex items-center gap-1.5 pl-8">
                        <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />
                        <span>Cue: {step.landmarkOrCue}</span>
                      </p>
                      <p className="text-xs text-emerald-800 hc-accent font-semibold flex items-center gap-1.5 pl-8">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{step.accessibilityNote}</span>
                      </p>
                    </div>
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

