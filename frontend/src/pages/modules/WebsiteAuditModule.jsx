import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, Code } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

const SAMPLE_HTML = `<div class="header">
  <img src="/logo.png">
  <form>
    <input type="email" placeholder="Enter your email">
    <button></button>
  </form>
  <a>Click here for more</a>
</div>`;

export default function WebsiteAuditModule() {
  const { announce } = useAccessibility();
  const [htmlInput, setHtmlInput] = useState(SAMPLE_HTML);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!htmlInput.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('website-audit', htmlInput);
      setResult(res.data);
      announce(`Audit completed. Score: ${res.data.overallScore} out of 100.`);
    } catch {
      announce('Audit error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Website Accessibility Checker (WCAG 2.1 Auditor)"
      category="Navigation & Employment"
      description="Audits provided HTML snippets or webpage structures for WCAG 2.1 Level A, AA, and AAA compliance issues and provides copy-ready remediation code."
      icon={ShieldCheck}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label
                htmlFor="audit-html-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
              >
                HTML Component Snippet or Page Structure to Audit
              </label>
              <textarea
                id="audit-html-input"
                rows={10}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="hc-input w-full p-4 rounded-xl border border-slate-300 font-mono text-xs"
                placeholder="Paste HTML markup or URL component structure..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                {loading ? 'Auditing WCAG 2.1 Compliance...' : 'Run WCAG 2.1 AA/AAA Audit'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            WCAG Conformance Report & Code Remediations
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Paste any HTML snippet and run the auditor to inspect missing alt attributes, unlabeled form controls, landmark gaps, and keyboard traps.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 hc-card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase text-violet-900 hc-accent">
                    {result.complianceStatus}
                  </span>
                  <p className="text-sm font-bold text-slate-900 hc-accent mt-1">
                    {result.summary}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-blue-700 text-white text-center">
                  <span className="block text-[10px] uppercase font-bold">Score</span>
                  <span className="text-xl font-black">{result.overallScore}/100</span>
                </div>
              </div>

              <AudioPlayer
                text={`Accessibility score ${result.overallScore} out of 100. ${result.complianceStatus}. ${result.summary}`}
                title="Listen to Audit Summary"
              />

              {Array.isArray(result.issues) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent">
                    Detected Accessibility Issues & Fixes
                  </h3>
                  {result.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-red-200 bg-red-50/50 hc-card space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase text-red-800 hc-accent">
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                          {issue.severity} • {issue.wcagCriterion}
                        </span>
                        <code className="text-xs px-2 py-0.5 rounded bg-white border border-slate-300 font-mono">
                          {issue.element}
                        </code>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 hc-accent">
                        {issue.description}
                      </p>
                      <div className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase mb-1">
                          <Code className="w-3 h-3" aria-hidden="true" />
                          <span>Recommended Accessible Fix:</span>
                        </div>
                        <pre>{issue.remediationCode}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(result.passedChecks) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
                    Passed Checks
                  </h3>
                  <ul className="space-y-1.5">
                    {result.passedChecks.map((chk, i) => (
                      <li
                        key={i}
                        className="text-xs font-semibold text-emerald-800 hc-accent flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

