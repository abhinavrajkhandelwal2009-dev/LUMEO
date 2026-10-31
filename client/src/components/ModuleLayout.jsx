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
    <div className="flex min-h-[calc(100vh-4.5rem)]">
      <Sidebar />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline mb-3 rounded px-1 py-0.5"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to AI Accessibility Hub</span>
            </Link>

            <div className="flex items-center gap-3.5">
              {Icon && (
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-amber-glow">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
              )}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">
                  {category}
                </span>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {title}
                </h1>
              </div>
            </div>
            <p className="mt-2.5 text-base opacity-85 max-w-3xl">{description}</p>
          </div>

          <button
            type="button"
            onClick={() => speakText(`${title}. ${description}`)}
            aria-label={`Read instructions for ${title}`}
            className="lumeo-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:border-amber-400"
          >
            <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Speak Page Guide</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
