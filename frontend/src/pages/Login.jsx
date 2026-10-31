import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Contrast } from 'lucide-react';
import api from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Login() {
  const { loginUser, prefs, updatePreferences, announce } = useAccessibility();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      loginUser(res.data.token, res.data.user);
      announce('Signed in successfully. Loading accessibility hub.');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        'Sign in failed. Please check your email and password.';
      setError(msg);
      announce(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="hc-card max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 hc-accent">
              Sign In to LUMEO
            </h1>
            <p className="text-sm text-slate-600 hc-accent mt-1">
              Load your personal accessibility preferences & history
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePreferences({ highContrast: !prefs.highContrast })}
            aria-pressed={prefs.highContrast}
            aria-label="Toggle High Contrast on Login Page"
            className="p-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 hc-card focus:ring-4 focus:ring-blue-600"
            title="Toggle High Contrast"
          >
            <Contrast className="w-5 h-5 text-slate-800 hc-accent" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-required="true"
              className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-4 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              aria-required="true"
              className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-4 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:opacity-50 focus:ring-4 focus:ring-blue-600"
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-sm text-slate-600 hc-accent">
          New to LUMEO?{' '}
          <Link
            to="/register"
            className="font-bold text-blue-700 hc-accent hover:underline rounded px-1 focus:ring-4 focus:ring-blue-600"
          >
            Create an Accessible Account
          </Link>
        </div>
      </div>
    </main>
  );
}

