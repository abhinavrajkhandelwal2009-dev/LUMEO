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

  const [selectedCategory, setSelectedCategory] = useState('All Modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);

  // Keyboard shortcuts Alt+1..0 and Shift+Alt+1..5
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey) return;
      const key = e.key;
      if (e.shiftKey) {
        const shiftMap = {
          '!': 10,
          '1': 10,
          '@': 11,
          '2': 11,
          '#': 12,
          '3': 12,
          '$': 13,
          '4': 13,
          '%': 14,
          '5': 14,
        };
        const idx = shiftMap[key];
        if (idx !== undefined && MODULES_CONFIG[idx]) {
          e.preventDefault();
          navigate(MODULES_CONFIG[idx].route);
        }
      } else {
        const numMap = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          '5': 4,
          '6': 5,
          '7': 6,
          '8': 7,
          '9': 8,
          '0': 9,
        };
        const idx = numMap[key];
        if (idx !== undefined && MODULES_CONFIG[idx]) {
          e.preventDefault();
          navigate(MODULES_CONFIG[idx].route);
        }
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
      selectedCategory === 'All Modules' ||
      mod.category === selectedCategory ||
      mod.secondaryCategory === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      mod.title.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="hc-card bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 hc-accent mb-1">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Central Accessibility Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 hc-accent">
              {user ? `Welcome back, ${user.name}` : 'All 15 Assistive AI Modules'}
            </h1>
            <p className="text-sm text-slate-600 hc-accent mt-1">
              Select any module below or use keyboard shortcuts (<kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-xs">Alt+1</kbd> to <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-xs">Shift+Alt+5</kbd>) for instant navigation.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label htmlFor="module-search" className="sr-only">
              Search accessibility modules
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="module-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15 tools (e.g., Braille, Dyslexia, Sign)..."
                className="hc-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-4 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter modules by target domain"
          className="flex flex-wrap items-center gap-2 mb-6"
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors focus:ring-4 focus:ring-blue-600 ${
                  active
                    ? 'bg-blue-700 text-white border-blue-700 hc-button-primary'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hc-card'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 15 Modules Responsive Grid */}
        <section aria-label="Accessibility Modules Grid">
          {filteredModules.length === 0 ? (
            <div className="hc-card bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="font-bold text-slate-800 hc-accent">
                No modules match "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Modules');
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModules.map((mod) => (
                <ModuleCard key={mod.id} module={mod} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Interactions History (Row-Level Security Verified) */}
        {user && recentLogs.length > 0 && (
          <section
            aria-labelledby="recent-logs-heading"
            className="mt-12 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-blue-700 hc-accent" aria-hidden="true" />
              <h2
                id="recent-logs-heading"
                className="text-lg font-extrabold text-slate-900 hc-accent"
              >
                Your Recent Saved Accessibility Interactions
              </h2>
            </div>
            <div className="divide-y divide-slate-200">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mr-2">
                      {log.module_name}
                    </span>
                    <span className="text-slate-800 hc-accent font-medium">
                      {String(log.input_payload).slice(0, 100)}
                      {String(log.input_payload).length > 100 ? '...' : ''}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 hc-accent">
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

