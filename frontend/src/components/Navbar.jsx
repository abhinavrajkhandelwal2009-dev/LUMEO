import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutGrid, User, LogOut, LogIn, Siren } from 'lucide-react';
import AccessibilityToolbar from './AccessibilityToolbar';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Navbar() {
  const { user, logoutUser } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="hc-nav sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Skip to Main Content Link for Keyboard & Screen Reader Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:font-bold focus:rounded-lg focus:ring-4 focus:ring-yellow-400"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-slate-900 hc-accent rounded-lg px-1 py-0.5 focus:ring-4 focus:ring-blue-600"
            aria-label="LUMEO Home - Technology That Understands Every Ability"
          >
            <span className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <span className="block leading-none">LUMEO</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-700 hc-accent">
                Every Ability
              </span>
            </div>
          </Link>

          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus:ring-4 focus:ring-blue-600 ${
                location.pathname.startsWith('/dashboard')
                  ? 'bg-blue-50 text-blue-800 hc-button-primary'
                  : 'text-slate-700 hover:bg-slate-100 hc-accent'
              }`}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              <span>All 15 Hub Modules</span>
            </Link>

            <Link
              to="/modules/emergency"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 focus:ring-4 focus:ring-blue-600"
            >
              <Siren className="w-4 h-4" aria-hidden="true" />
              <span>Emergency SOS</span>
            </Link>
          </nav>
        </div>

        {/* Embedded Global Accessibility Toolbar */}
        <AccessibilityToolbar />

        {/* User Auth & Profile Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/profile"
                aria-label="Accessibility Profile Preferences"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors focus:ring-4 focus:ring-blue-600 ${
                  location.pathname === '/profile'
                    ? 'bg-blue-700 text-white border-blue-700 hc-button-primary'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hc-card'
                }`}
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out of LUMEO"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 hc-card focus:ring-4 focus:ring-blue-600"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 border border-slate-300 hover:bg-slate-100 hc-card focus:ring-4 focus:ring-blue-600"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hc-button-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-600"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

