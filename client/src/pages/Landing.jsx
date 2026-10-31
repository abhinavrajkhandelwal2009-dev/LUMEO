import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Keyboard,
  Contrast,
  ArrowRight,
} from 'lucide-react';
import { MODULES_CONFIG } from '../utils/modulesConfig';
import ModuleCard from '../components/ModuleCard';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Landing() {
  const { speakText } = useAccessibility();

  const overviewAnnouncement =
    'Welcome to LUMEO: Technology That Understands Every Ability. A unified WCAG 2.1 AA and AAA accessible platform featuring 15 AI-powered tools for vision, hearing, speech, learning, and mobility support.';

  return (
    <main id="main-content" className="pb-20">
      {/* Hero Banner */}
      <section className="hc-card relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" aria-hidden="true" />
            <span>WCAG 2.1 AA/AAA Compliant • Powered by Google Gemini Multimodal AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
            LUMEO – Technology That Understands{' '}
            <span className="text-yellow-300 underline decoration-yellow-400/60">
              Every Ability
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl leading-relaxed mb-8">
            Eliminating digital, physical, linguistic, and cognitive barriers. LUMEO unifies 15 specialized assistive tools—spanning Sign Language, Visual Scene Description, Dyslexia Reading, Live Captions, and Emergency Communication—into one accessible co-pilot.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard"
              className="hc-button-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-yellow-400 text-slate-950 font-extrabold text-base hover:bg-yellow-300 transition-colors focus:ring-4 focus:ring-blue-500"
            >
              <span>Launch Central Accessibility Hub</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => speakText(overviewAnnouncement)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/30 focus:ring-4 focus:ring-yellow-400"
            >
              <Volume2 className="w-5 h-5 text-yellow-300" aria-hidden="true" />
              <span>Listen to Platform Overview</span>
            </button>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-semibold text-base border border-white/25 focus:ring-4 focus:ring-yellow-400"
            >
              <span>Create Personal Profile</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Guide & Accessibility Statement */}
      <section
        aria-labelledby="quickstart-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <Contrast className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 id="quickstart-heading" className="text-lg font-extrabold text-slate-900 hc-accent mb-2">
              1. Instant Visual & Cognitive Controls
            </h2>
            <p className="text-sm text-slate-600 hc-accent leading-relaxed">
              Use the top global toolbar on any screen to toggle AAA High-Contrast mode, scale typography up to 22px (A++), activate OpenDyslexic spacing, or mute/unmute global speech.
            </p>
          </div>

          <div className="hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 hc-accent mb-2">
              2. Full Keyboard & Screen Reader Support
            </h2>
            <p className="text-sm text-slate-600 hc-accent leading-relaxed">
              Every module includes explicit ARIA landmarks, live polite status announcements, high-visibility 4px focus rings, and dedicated keyboard shortcuts (<kbd className="px-1 border rounded">Alt+1</kbd> through <kbd className="px-1 border rounded">Shift+Alt+5</kbd>).
            </p>
          </div>

          <div className="hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 hc-accent mb-2">
              3. Accessibility Conformance Statement
            </h2>
            <p className="text-sm text-slate-600 hc-accent leading-relaxed">
              LUMEO conforms to W3C WCAG 2.1 Level AA and AAA guidelines. All AI interactions via Google Gemini execute securely server-side with strict Row-Level Security (RLS) isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Complete 15-Module Feature Grid */}
      <section
        aria-labelledby="modules-grid-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 hc-accent">
              Complete Assistive Suite
            </span>
            <h2
              id="modules-grid-heading"
              className="text-3xl font-extrabold text-slate-900 hc-accent mt-1"
            >
              All 15 AI Accessibility Modules
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="hc-button-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 focus:ring-4 focus:ring-blue-600"
          >
            <span>Open Interactive Hub</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES_CONFIG.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section>

      {/* Accessibility Commitment Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 text-sm text-slate-600 hc-accent flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span className="font-semibold">
            LUMEO – Technology That Understands Every Ability • WCAG 2.1 AA/AAA Verified
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:underline font-semibold">
            Dashboard
          </Link>
          <Link to="/modules/emergency" className="hover:underline font-semibold text-red-700">
            Emergency Hub
          </Link>
          <Link to="/profile" className="hover:underline font-semibold">
            Accessibility Preferences
          </Link>
        </div>
      </footer>
    </main>
  );
}

