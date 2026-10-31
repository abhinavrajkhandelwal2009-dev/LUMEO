import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

import SignLanguageModule from './pages/modules/SignLanguageModule';
import VisualAssistantModule from './pages/modules/VisualAssistantModule';
import TtsSttModule from './pages/modules/TtsSttModule';
import TranslatorModule from './pages/modules/TranslatorModule';
import DyslexiaReaderModule from './pages/modules/DyslexiaReaderModule';
import EducationModule from './pages/modules/EducationModule';
import EmergencyModule from './pages/modules/EmergencyModule';
import GovernmentModule from './pages/modules/GovernmentModule';
import TransportModule from './pages/modules/TransportModule';
import ColorIdModule from './pages/modules/ColorIdModule';
import WebsiteAuditModule from './pages/modules/WebsiteAuditModule';
import MentalHealthModule from './pages/modules/MentalHealthModule';
import MathAssistantModule from './pages/modules/MathAssistantModule';
import JobAssistantModule from './pages/modules/JobAssistantModule';

export default function App() {
  return (
    <AccessibilityProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* All 15 Mandatory Accessibility Modules */}
                <Route path="/modules/sign-language" element={<SignLanguageModule />} />
                <Route path="/modules/visual-assistant" element={<VisualAssistantModule />} />
                <Route path="/modules/tts-stt" element={<TtsSttModule />} />
                <Route path="/modules/translator" element={<TranslatorModule />} />
                <Route path="/modules/dyslexia-reader" element={<DyslexiaReaderModule />} />
                <Route path="/modules/education" element={<EducationModule />} />
                <Route path="/modules/emergency" element={<EmergencyModule />} />
                <Route path="/modules/government" element={<GovernmentModule />} />
                <Route path="/modules/transport" element={<TransportModule />} />
                <Route path="/modules/color-id" element={<ColorIdModule />} />
                <Route path="/modules/website-audit" element={<WebsiteAuditModule />} />
                <Route path="/modules/mental-health" element={<MentalHealthModule />} />
                <Route path="/modules/math-assistant" element={<MathAssistantModule />} />
                <Route path="/modules/job-assistant" element={<JobAssistantModule />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ErrorBoundary>
    </AccessibilityProvider>
  );
}

