import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ModuleCard({ module }) {
  const { speakText } = useAccessibility();
  const IconComponent = module.icon;

  return (
    <article
      className="lumeo-card group rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-amber-glow flex flex-col justify-between"
      aria-labelledby={`module-title-${module.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-teal-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
            <IconComponent className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${module.badgeColor}`}
            >
              {module.category}
            </span>
            <button
              type="button"
              onClick={() => speakText(`${module.title}. ${module.description}`)}
              aria-label={`Read aloud description for ${module.title}`}
              className="lumeo-btn-secondary w-11 h-11 rounded-xl flex items-center justify-center hover:border-amber-400"
              title="Speak module description"
            >
              <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        <h3
          id={`module-title-${module.id}`}
          className="font-display text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors"
        >
          {module.number}. {module.title}
        </h3>

        <p className="text-sm opacity-85 leading-relaxed mb-6">{module.description}</p>
      </div>

      <div className="pt-4 border-t border-amber-500/15 flex items-center justify-between gap-2">
        <span className="text-xs font-mono opacity-75">
          Key: <kbd className="px-2 py-0.5 rounded bg-black/20 border border-amber-500/20">{module.shortcut}</kbd>
        </span>

        <Link
          to={module.route}
          aria-label={`Launch ${module.title}`}
          className="lumeo-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold"
        >
          <span>Launch Studio</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
