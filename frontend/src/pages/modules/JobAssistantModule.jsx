import React, { useState } from 'react';
import { Briefcase, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function JobAssistantModule() {
  const { announce } = useAccessibility();
  const [jobDescription, setJobDescription] = useState(
    'We are seeking a Customer Support & Accessibility Operations Specialist to join our remote-first team. Responsibilities include responding to user inquiries via email/chat, documenting product usability feedback, and collaborating with engineering teams. Required: strong written communication and empathy. Nice to have: familiarity with WCAG 2.1 or ticketing tools.'
  );
  const [candidateProfile, setCandidateProfile] = useState(
    'Organized communicator with experience in digital customer support, assistive technology advocacy, and remote collaboration.'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const res = await processModuleAI('job-assistant', jobDescription, {
        candidateProfile,
      });
      setResult(res.data);
      announce('Job description simplified and cover letter drafted.');
    } catch {
      announce('Could not process job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Inclusive Job & Career Assistant"
      category="Navigation & Employment"
      description="Simplifies job descriptions into plain language, separates must-have skills from bonus skills, identifies workplace accommodations, and drafts a tailored cover letter."
      icon={Briefcase}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label
                htmlFor="job-desc-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1"
              >
                Job Posting / Description
              </label>
              <textarea
                id="job-desc-input"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm"
                placeholder="Paste the job posting here..."
              />
            </div>

            <div>
              <label
                htmlFor="job-candidate-input"
                className="block text-sm font-bold text-slate-800 hc-accent mb-1"
              >
                Your Strengths & Background (for Cover Letter)
              </label>
              <textarea
                id="job-candidate-input"
                rows={3}
                value={candidateProfile}
                onChange={(e) => setCandidateProfile(e.target.value)}
                className="hc-input w-full p-3.5 rounded-xl border border-slate-300 text-sm"
                placeholder="Briefly describe your strengths or experience..."
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
                  ? 'Analyzing Role & Drafting Cover Letter...'
                  : 'Simplify Job & Draft Cover Letter'}
              </span>
            </button>
          </form>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-7 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            {result?.roleTitlePlain || 'Plain-Language Role Breakdown & Cover Letter'}
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Paste a job description and your strengths to break down what you will actually do day-to-day, core skills vs. nice-to-haves, workplace accommodations, and a ready-to-send cover letter.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 hc-card">
                  <h3 className="text-xs font-extrabold uppercase text-emerald-900 hc-accent mb-2">
                    Essential Must-Have Skills
                  </h3>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-800 hc-accent">
                    {(result.mustHaveSkills || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 hc-card">
                  <h3 className="text-xs font-extrabold uppercase text-blue-900 hc-accent mb-2">
                    Workplace Accommodations You Can Request
                  </h3>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-800 hc-accent">
                    {(result.potentialAccommodations || []).map((acc, i) => (
                      <li key={i}>• {acc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.tailoredCoverLetter && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-500 hc-accent">
                    <FileText className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Tailored Inclusive Cover Letter</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 hc-card whitespace-pre-line text-sm font-medium text-slate-900 hc-accent">
                    {result.tailoredCoverLetter}
                  </div>
                  <AudioPlayer
                    text={result.tailoredCoverLetter}
                    title="Listen to Cover Letter Draft"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

