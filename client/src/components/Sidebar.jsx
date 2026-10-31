import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { MODULES_CONFIG } from '../utils/modulesConfig';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      aria-label="Core Accessibility Modules Navigation"
      className="lumeo-card hidden lg:flex flex-col w-72 shrink-0 border-r border-amber-500/20 min-h-[calc(100vh-4.5rem)] p-4"
    >
      <div className="mb-4">
        <Link
          to="/dashboard"
          className={`min-h-[48px] flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/dashboard'
              ? 'lumeo-btn-primary shadow-amber-glow'
              : 'lumeo-btn-secondary hover:border-amber-400/50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          <span>Core AI Studio Hub</span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Flagship Modules</span>
      </div>

      <nav aria-label="Accessibility Modules List" className="space-y-1.5 overflow-y-auto pr-1">
        {MODULES_CONFIG.map((mod) => {
          const IconComponent = mod.icon;
          const baseRoute = mod.route.split('?')[0];
          const isActive = location.pathname === baseRoute;

          return (
            <Link
              key={mod.id}
              to={mod.route}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'hover:bg-amber-400/10 opacity-85 hover:opacity-100'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <IconComponent className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span className="truncate">
                  {mod.number}. {mod.shortTitle}
                </span>
              </span>
              <kbd className="hidden xl:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/30 border border-amber-500/20 font-mono">
                {mod.shortcut}
              </kbd>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
