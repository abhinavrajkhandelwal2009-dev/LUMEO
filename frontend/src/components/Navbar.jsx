import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Sun,
  Moon,
  User,
  LogOut,
  LogIn,
  Siren,
} from 'lucide-react';
import AccessibilityToolbar from './AccessibilityToolbar';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Navbar() {
  const {
    user,
    logoutUser,
    prefs,
    updatePreferences,
    isPanelOpen,
    setIsPanelOpen,
  } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 lumeo-card border-b border-amber-500/20 backdrop-blur-xl">
        {/* Exemplary WCAG Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-5 focus:py-3 focus:bg-amber-400 focus:text-slate-950 focus:font-extrabold focus:rounded-xl"
        >
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Luminous Brand Logo & Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl px-2 py-1 group"
              aria-label="LUMEO Home – Technology That Understands Every Ability"
            >
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-amber-glow font-black">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <span className="font-display text-2xl font-extrabold tracking-tight block leading-none">
                  LUMEO
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mt-0.5">
                  Every Ability
                </span>
              </div>
            </Link>

            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-2">
              <Link
                to="/dashboard"
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname.startsWith('/dashboard') ||
                  location.pathname.startsWith('/modules')
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/40'
                    : 'hover:bg-amber-400/10'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>AI Studio Hub</span>
              </Link>

              <a
                href="/#live-demos"
                className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-amber-400/10"
              >
                Live Demos
              </a>

              <a
                href="/#built-for-everyone"
                className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-amber-400/10"
              >
                Abilities
              </a>

              <Link
                to="/modules/emergency"
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25"
              >
                <Siren className="w-4 h-4" aria-hidden="true" />
                <span>SOS Beacon</span>
              </Link>
            </nav>
          </div>

          {/* Right Actions: Theme Switcher + Always-Visible Accessibility Panel Button + Auth */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                updatePreferences({
                  theme: prefs.theme === 'dark' ? 'light' : 'dark',
                })
              }
              aria-label={`Switch to ${prefs.theme === 'dark' ? 'Warm Light' : 'Obsidian Dark'} theme`}
              className="lumeo-btn-secondary w-11 h-11 rounded-xl flex items-center justify-center"
              title="Toggle Light / Dark Theme"
            >
              {prefs.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-amber-600" aria-hidden="true" />
              )}
            </button>

            {/* Always-Visible Accessibility Panel Trigger */}
            <button
              type="button"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              aria-expanded={isPanelOpen}
              aria-label="Open Built-in Accessibility Panel"
              className="lumeo-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shadow-amber-glow"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Accessibility Panel</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  aria-label="User Accessibility Profile"
                  className="lumeo-btn-secondary inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm"
                >
                  <User className="w-4 h-4 text-teal-400" aria-hidden="true" />
                  <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="lumeo-btn-secondary w-11 h-11 rounded-xl flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="lumeo-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              >
                <LogIn className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <AccessibilityToolbar />
    </>
  );
}
