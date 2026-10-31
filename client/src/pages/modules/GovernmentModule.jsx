import React, { useState } from 'react';
import { Landmark, Sparkles, Calendar, FileCheck2 } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function GovernmentModule() {
  const { announce } = useAccessibility();
  const [noticeText, setNoticeText] = useState(
    'NOTICE OF ANNUAL DISABILITY BENEFIT RECERTIFICATION: Pursuant to statutory provisions under Section 402(b), the claimant hereinafter identified must submit mandatory verification documentation of current residency and household income within 30 days of November 15, 2026. Failure to furnish requisite documentation may result in temporary suspension of monthly disbursements.'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async (e) => {
    e.preventDefault();
    if (!noticeText.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('government', noticeText);
      setResult(res.data);
      announce('Government notice simplified into plain action steps.');
    } catch {
      announce('Error simplifying government notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Government Services & Legal Form Simplifier"
      category="Reading & Education"
      description="Simplifies complex government forms, official notices, and legal jargon into plain language with clear action steps, deadlines, and required document checklists."
      icon={Landmark}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSimplify} className="space-y-4">
            <div>
              <label
                htmlFor="gov-notice-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
              >
                Official Government Form Text or Legal Notice
              </label>
              <textarea
                id="gov-notice-input"
                rows={8}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="hc-input w-full p-4 rounded-xl border border-slate-300 text-sm"
                placeholder="Paste text from a benefit letter, tax notice, housing application, or civic form..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading
                  ? 'Translating Legal Jargon...'
                  : 'Explain What I Need to Do in Plain Language'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Plain-Language Action Plan & Checklist
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Paste any official letter or form instructions to extract a plain-language overview, numbered action steps, important deadlines, and required documents.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 hc-card">
                <span className="text-xs font-bold uppercase text-blue-800 hc-accent">
                  Plain Overview
                </span>
                <p className="text-base font-bold text-slate-900 hc-accent mt-1">
                  {result.overview}
                </p>
              </div>

              <AudioPlayer
                text={`${result.overview}. Deadline: ${result.deadlines}. Action steps: ${
                  Array.isArray(result.actionSteps) ? result.actionSteps.join('. ') : ''
                }`}
                title="Listen to Plain-Language Summary"
              />

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 hc-card flex items-center gap-3">
                <Calendar className="w-6 h-6 text-amber-800 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-900 hc-accent">
                    Important Deadline
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 hc-accent">
                    {result.deadlines}
                  </p>
                </div>
              </div>

              {Array.isArray(result.actionSteps) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Step-by-Step What You Need to Do
                  </h3>
                  <ol className="space-y-2">
                    {result.actionSteps.map((step, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hc-card text-sm font-semibold flex items-start gap-2.5"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {Array.isArray(result.requiredDocuments) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Required Documents Checklist</span>
                  </h3>
                  <div className="space-y-2">
                    {result.requiredDocuments.map((doc, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hc-card text-sm font-medium cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-emerald-600"
                        />
                        <span>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(result.jargonTranslations) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Legal Jargon Decoder
                  </h3>
                  <div className="space-y-2">
                    {result.jargonTranslations.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-slate-200 hc-card text-xs"
                      >
                        <span className="font-bold text-slate-900 hc-accent">
                          "{item.legalTerm}"
                        </span>{' '}
                        → <span className="text-blue-800 hc-accent font-semibold">{item.plainMeaning}</span>
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

