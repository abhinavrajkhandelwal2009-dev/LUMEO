import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ModuleCard({ module }) {
  const { speakText } = useAccessibility();
  const IconComponent = module.icon;

  return (
    <article
      className="hc-card group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
      aria-labelledby={`module-title-${module.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <IconComponent className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${module.badgeColor}`}
            >
              {module.category}
            </span>
            <button
              type="button"
              onClick={() => speakText(`${module.title}. ${module.description}`)}
              aria-label={`Read aloud description for ${module.title}`}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus:ring-4 focus:ring-blue-600"
              title="Read card aloud"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <h3
          id={`module-title-${module.id}`}
          className="text-lg font-bold text-slate-900 hc-accent mb-1.5"
        >
          {module.number}. {module.title}
        </h3>

        <p className="text-sm text-slate-600 hc-accent leading-relaxed mb-4">
          {module.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500 hc-accent">
          Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded">{module.shortcut}</kbd>
        </span>

        <Link
          to={module.route}
          aria-label={`Launch ${module.title}`}
          className="hc-button-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors focus:ring-4 focus:ring-blue-600"
        >
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

