import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Accessibility ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          id="main-content"
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900"
        >
          <div className="max-w-lg w-full bg-white border-2 border-red-600 rounded-2xl p-8 shadow-lg text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">
              Accessible Recovery Mode Activated
            </h1>
            <p className="text-slate-700 mb-6">
              LUMEO encountered an unexpected interface issue. Your accessibility preferences and saved interactions remain safe.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 focus:ring-4 focus:ring-blue-600"
            >
              <RefreshCw className="w-5 h-5" aria-hidden="true" />
              <span>Return to Central Accessibility Hub</span>
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

