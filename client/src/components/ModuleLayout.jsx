import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ModuleLayout({
  title,
  category,
  description,
  icon: Icon,
  children,
}) {
  const { speakText } = useAccessibility();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hc-accent hover:underline mb-2 rounded px-1 py-0.5 focus:ring-4 focus:ring-blue-600"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to All 15 Accessibility Modules</span>
            </Link>
            <div className="flex items-center gap-3">
              {Icon && (
                <span className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 hc-accent">
                  {category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 hc-accent">
                  {title}
                </h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 hc-accent max-w-3xl">{description}</p>
          </div>

          <button
            type="button"
            onClick={() => speakText(`${title}. ${description}`)}
            aria-label={`Read instructions for ${title}`}
            className="hc-card inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-100 focus:ring-4 focus:ring-blue-600"
          >
            <Volume2 className="w-4 h-4 text-blue-700 hc-accent" aria-hidden="true" />
            <span>Read Guide Aloud</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

