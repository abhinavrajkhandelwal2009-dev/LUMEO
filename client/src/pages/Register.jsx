import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Contrast } from 'lucide-react';
import api from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Register() {
  const { loginUser, prefs, updatePreferences, announce } = useAccessibility();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password });
      loginUser(res.data.token, res.data.user);
      announce('Account created successfully. Redirecting to dashboard.');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        'Registration failed. Please check your details.';
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
              Create Your LUMEO Account
            </h1>
            <p className="text-sm text-slate-600 hc-accent mt-1">
              Save your visual, speech, and cognitive preferences across devices
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePreferences({ highContrast: !prefs.highContrast })}
            aria-pressed={prefs.highContrast}
            aria-label="Toggle High Contrast on Registration Page"
            className="p-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 hc-card focus:ring-4 focus:ring-blue-600"
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
              htmlFor="register-name"
              className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
            >
              Full Name (minimum 2 characters)
            </label>
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              aria-required="true"
              className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-4 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
            >
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              aria-required="true"
              className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-4 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-bold text-slate-800 hc-accent mb-1.5"
            >
              Password (minimum 6 characters)
            </label>
            <input
              id="register-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              aria-required="true"
              className="hc-input w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-4 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:opacity-50 focus:ring-4 focus:ring-blue-600"
          >
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-sm text-slate-600 hc-accent">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-blue-700 hc-accent hover:underline rounded px-1 focus:ring-4 focus:ring-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

