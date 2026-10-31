import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { MODULES_CONFIG } from '../utils/modulesConfig';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      aria-label="15 Accessibility Modules Quick Launcher"
      className="hc-card hidden lg:flex flex-col w-72 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4"
    >
      <div className="mb-4">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors focus:ring-4 focus:ring-blue-600 ${
            location.pathname === '/dashboard'
              ? 'bg-blue-700 text-white hc-button-primary'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hc-card'
          }`}
        >
          <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          <span>Central Hub (All 15)</span>
        </Link>
      </div>

      <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-500 hc-accent mb-2">
        Quick Module Switcher
      </p>

      <nav aria-label="Accessibility Modules List" className="space-y-1 overflow-y-auto pr-1">
        {MODULES_CONFIG.map((mod) => {
          const IconComponent = mod.icon;
          const baseRoute = mod.route.split('?')[0];
          const isActive =
            location.pathname === baseRoute &&
            (mod.id !== 'stt-studio' || location.search.includes('tab=stt'));

          return (
            <Link
              key={mod.id}
              to={mod.route}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus:ring-4 focus:ring-blue-600 ${
                isActive
                  ? 'bg-blue-50 text-blue-800 border border-blue-300 hc-button-primary'
                  : 'text-slate-700 hover:bg-slate-100 hc-accent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <IconComponent className="w-4 h-4 shrink-0 text-blue-700 hc-accent" aria-hidden="true" />
                <span className="truncate">
                  {mod.number}. {mod.shortTitle}
                </span>
              </span>
              <kbd className="hidden xl:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 font-mono">
                {mod.shortcut}
              </kbd>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

