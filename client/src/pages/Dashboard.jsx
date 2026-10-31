import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, History, Sparkles, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ModuleCard from '../components/ModuleCard';
import { MODULES_CONFIG, MODULE_CATEGORIES } from '../utils/modulesConfig';
import { fetchUserInteractions } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Dashboard() {
  const { user, announce } = useAccessibility();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('All 7 Core Hubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);

  // Keyboard shortcuts Alt+1..7 for the 7 Essential Core Hubs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 7 && MODULES_CONFIG[num - 1]) {
        e.preventDefault();
        navigate(MODULES_CONFIG[num - 1].route);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchUserInteractions()
        .then((items) => setRecentLogs((items || []).slice(0, 5)))
        .catch(() => {});
    }
  }, [user]);

  const filteredModules = MODULES_CONFIG.filter((mod) => {
    const matchesCategory =
      selectedCategory === 'All 7 Core Hubs' || mod.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      mod.title.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)]">
      <Sidebar />

      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header Card */}
        <div className="lumeo-card rounded-3xl p-6 sm:p-8 mb-8 flex flex-wrap items-center justify-between gap-4 border border-amber-400/30">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>7 Essential Accessibility Hubs</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold">
              {user ? `Welcome back, ${user.name}` : 'Lumeo Core AI Accessibility Studio'}
            </h1>
            <p className="text-sm opacity-85 mt-1">
              Every module features a dedicated high-contrast Output Box and instant Text-to-Speech synthesis. Use <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-amber-500/30 font-mono text-xs">Alt+1</kbd> through <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-amber-500/30 font-mono text-xs">Alt+7</kbd> to jump directly.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <label htmlFor="module-search" className="sr-only">
              Search 7 core accessibility hubs
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="module-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter hubs (e.g. Blind, Sign, STT)..."
                className="lumeo-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter core hubs by category"
          className="flex flex-wrap items-center gap-2.5 mb-8"
        >
          {MODULE_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setSelectedCategory(category);
                  announce(`Showing ${category}`);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                  active
                    ? 'lumeo-btn-primary shadow-amber-glow'
                    : 'lumeo-btn-secondary hover:border-amber-400'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 7 Core Modules Grid */}
        <section aria-label="7 Core Accessibility Hubs">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModules.map((mod) => (
              <ModuleCard key={mod.id} module={mod} />
            ))}
          </div>
        </section>

        {/* Recent Saved Interactions */}
        {user && recentLogs.length > 0 && (
          <section
            aria-labelledby="recent-logs-heading"
            className="mt-12 lumeo-card rounded-3xl p-6 border border-amber-400/25"
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <h2 id="recent-logs-heading" className="font-display text-xl font-bold">
                Recent Saved Interactions
              </h2>
            </div>
            <div className="divide-y divide-amber-500/15">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 mr-2">
                      {log.module_name}
                    </span>
                    <span className="font-semibold">
                      {String(log.input_payload).slice(0, 100)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs opacity-70">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
