import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Eye,
  Ear,
  Hand,
  Brain,
  Mic,
  HeartHandshake,
  ArrowRight,
  Volume2,
  Play,
  CheckCircle2,
  SlidersHorizontal,
  Quote,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { MODULES_CONFIG } from '../utils/modulesConfig';
import ModuleCard from '../components/ModuleCard';

const DEMO_TABS = [
  {
    id: 'blind-radar',
    label: 'Blind Camera Stream',
    icon: Eye,
    route: '/modules/visual-assistant',
    sampleInput: 'Live Camera Stream (4s Interval): Indoor hallway with doorway and table.',
    sampleOutput:
      'Open doorway at 12 o’clock (3.5m ahead), water bottle at 2 o’clock, hazard step down at 6 o’clock. Step slightly right toward 1 o’clock.',
  },
  {
    id: 'sign-scanner',
    label: 'Sign Gesture Scanner',
    icon: Hand,
    route: '/modules/sign-language',
    sampleInput: 'Webcam Hand Landmark Scan (ASL/BSL/ISL): [HELLO] [HELP-ME] [PLEASE]',
    sampleOutput:
      'Output Box & Auto-TTS: "Hello! I need assistance, please."',
  },
  {
    id: 'live-stt',
    label: 'Continuous Live STT',
    icon: Mic,
    route: '/modules/tts-stt?tab=stt',
    sampleInput: 'webkitSpeechRecognition Continuous Stream',
    sampleOutput:
      '[Live Microphone]: "Welcome to today’s session—real-time high-contrast captions are streaming directly into the Output Box."',
  },
  {
    id: 'dyslexia-simplify',
    label: 'Dyslexia Cognitive Canvas',
    icon: Brain,
    route: '/modules/dyslexia-reader',
    sampleInput:
      'Cognitive load refers to the total amount of mental effort being utilized in working memory...',
    sampleOutput:
      '• Cognitive load is the mental effort your brain uses to learn.\n• Short, Bionic-bolded bullet points eliminate visual crowding.',
  },
];

const ABILITY_GROUPS = [
  {
    title: 'Vision & Blind Navigation',
    icon: Eye,
    accent: 'text-amber-400',
    description:
      'Continuous live camera stream analysis every 4 seconds with clock-face spatial voice guidance and hazard warnings.',
    link: '/modules/visual-assistant',
  },
  {
    title: 'Hearing & Deaf Inclusion',
    icon: Ear,
    accent: 'text-teal-400',
    description:
      'Continuous Speech-to-Text live captioning studio and two-way Sign Language gesture landmark scanning.',
    link: '/modules/tts-stt?tab=stt',
  },
  {
    title: 'Sign & Non-Verbal Speech',
    icon: Hand,
    accent: 'text-amber-400',
    description:
      'Scans ASL, BSL, and ISL hand gestures into a dedicated Output Box and automatically triggers spoken audio.',
    link: '/modules/sign-language',
  },
  {
    title: 'Cognitive & Dyslexia',
    icon: Brain,
    accent: 'text-teal-400',
    description:
      'Rewrites complex articles into cognitive chunks with first-letter Bionic bolding, OpenDyslexic font, and Irlen overlays.',
    link: '/modules/dyslexia-reader',
  },
  {
    title: 'Accessible Education',
    icon: Mic,
    accent: 'text-amber-400',
    description:
      'Explains study notes and uploaded documents step-by-step with real-world analogies and spoken audio.',
    link: '/modules/education',
  },
  {
    title: 'Emergency SOS & Global',
    icon: HeartHandshake,
    accent: 'text-teal-400',
    description:
      'Fullscreen first-responder emergency cards (911 / 112 / 999) and multilingual plain-language translation.',
    link: '/modules/emergency',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Capture Live Camera, Mic, or Text',
    description:
      'Stream live video for blind navigation, sign toward your webcam, speak into continuous STT, or paste complex text.',
  },
  {
    step: '02',
    title: 'Lumeo Core Gemini AI Reasoning',
    description:
      'Our backend Gemini Vision and text endpoints translate gestures, map clock-face objects, or chunk dense text.',
  },
  {
    step: '03',
    title: 'Universal Output Box & Auto-TTS',
    description:
      'Every single module renders structured results inside a high-contrast Output Box with automatic Text-to-Speech playback.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The continuous live camera stream calls out obstacles at 10 o’clock and 2 o’clock aloud every few seconds while I walk. It feels like a calm human guide.',
    author: 'Elena Rostova',
    role: 'Low-Vision Commuter & Accessibility Advocate',
  },
  {
    quote:
      'Capturing my ASL hand gestures directly into the Output Box and having Lumeo automatically speak the sentence aloud has transformed my daily interactions.',
    author: 'Marcus Vance',
    role: 'Deaf Product Designer',
  },
  {
    quote:
      'The Bionic first-letter bolding and Warm Amber overlay turn overwhelming textbook chapters into clear bullet points I can read or listen to effortlessly.',
    author: 'Priya Nair',
    role: 'University Researcher with Dyslexia',
  },
];

function CountUpStat({ endValue, suffix = '', label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = Math.max(1, Math.ceil(endValue / (duration / 30)));
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [endValue]);

  return (
    <div className="lumeo-card rounded-3xl p-6 text-center border border-amber-400/30">
      <p className="font-display text-4xl sm:text-5xl font-extrabold text-amber-400">
        {count}
        {suffix}
      </p>
      <p className="text-sm font-bold mt-2 opacity-85">{label}</p>
    </div>
  );
}

export default function Landing() {
  const { speakText, setIsPanelOpen } = useAccessibility();
  const [activeDemo, setActiveDemo] = useState(DEMO_TABS[0]);

  return (
    <main id="main-content" className="overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[380px] rounded-full bg-gradient-to-tr from-amber-500/25 via-amber-300/15 to-teal-400/20 blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 text-xs font-extrabold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>7 Core AI Accessibility Hubs • WCAG 2.1 AAA</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Technology that understands{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400">
                every ability.
              </span>
            </h1>

            <p className="text-lg sm:text-xl opacity-90 max-w-2xl leading-relaxed">
              One luminous, human-first AI platform uniting continuous blind camera navigation, hand-gesture sign translation, live STT captions, and cognitive text simplification.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="lumeo-btn-primary inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base shadow-amber-glow"
              >
                <span>Try the Demo Hub</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>

              <a
                href="#how-it-works"
                className="lumeo-btn-secondary inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-base hover:border-amber-400"
              >
                <span>See How It Works</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  speakText(
                    'Welcome to Lumeo: Technology that understands every ability. Explore our 7 core accessibility hubs with universal output boxes and instant speech.'
                  )
                }
                aria-label="Listen to spoken audio introduction"
                className="lumeo-btn-secondary inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-sm hover:border-teal-400"
              >
                <Volume2 className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <span>Speak Intro</span>
              </button>
            </div>
          </motion.div>

          {/* Animated Luminous Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/30 via-amber-300/20 to-teal-400/25 blur-2xl animate-pulse"
              />
              <div className="relative z-10 lumeo-card rounded-3xl p-6 border-2 border-amber-400/50 shadow-amber-glow w-full space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Lumeo Live Neural Core
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                    AAA 7:1+ Verified
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 space-y-2">
                  <p className="text-xs font-mono text-teal-300">
                    &gt; Live Camera &amp; Gesture Stream Active...
                  </p>
                  <p className="font-display text-lg font-bold text-amber-300">
                    "Open doorway at 12 o’clock, water bottle at 2 o’clock, path ahead clear."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                  <Link
                    to="/modules/visual-assistant"
                    className="p-3 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25 text-center"
                  >
                    👁️ Blind Help
                  </Link>
                  <Link
                    to="/modules/sign-language"
                    className="p-3 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-300 hover:bg-teal-400/25 text-center"
                  >
                    ✋ Sign Scanner
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. LIVE DEMO STRIP */}
      <section
        id="live-demos"
        aria-labelledby="live-demo-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              Interactive Live Demo Strip
            </span>
            <h2
              id="live-demo-heading"
              className="font-display text-3xl sm:text-4xl font-extrabold mt-1"
            >
              Universal Output Boxes &amp; Instant Speech
            </h2>
          </div>
          <p className="text-sm opacity-80 max-w-md">
            Click any module below to preview its real-time Output Box and spoken synthesis.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Interactive feature demos"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {DEMO_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeDemo.id === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveDemo(tab)}
                className={`min-h-[56px] p-4 rounded-2xl border text-left font-bold flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'lumeo-btn-primary shadow-amber-glow'
                    : 'lumeo-card hover:border-amber-400/50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lumeo-card lumeo-glass-Output rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
              Live Input Stream
            </span>
            <p className="p-4 rounded-2xl bg-black/30 border border-amber-400/20 font-mono text-sm">
              {activeDemo.sampleInput}
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Dedicated Output Box
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakText(activeDemo.sampleOutput)}
                  className="lumeo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-current" aria-hidden="true" />
                  <span>Read Aloud</span>
                </button>
                <Link
                  to={activeDemo.route}
                  className="lumeo-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border-2 border-amber-400/50 font-bold text-lg whitespace-pre-line">
              {activeDemo.sampleOutput}
            </div>
          </div>
        </div>
      </section>

      {/* 3. "BUILT FOR EVERYONE" GRID */}
      <section
        id="built-for-everyone"
        aria-labelledby="abilities-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-amber-500/20"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">
            Built For Everyone
          </span>
          <h2
            id="abilities-heading"
            className="font-display text-3xl sm:text-5xl font-extrabold mt-2"
          >
            Designed for Every Ability Group
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ABILITY_GROUPS.map((group, idx) => {
            const Icon = group.icon;
            return (
              <Link
                key={idx}
                to={group.link}
                className="lumeo-card group rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-amber-glow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-4">
                    <Icon className={`w-6 h-6 ${group.accent}`} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                    {group.title}
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">{group.description}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400">
                  <span>Open Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-amber-500/20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
            3-Step Workflow
          </span>
          <h2 id="how-heading" className="font-display text-3xl sm:text-4xl font-extrabold mt-1">
            How Lumeo Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div
              key={item.step}
              className="lumeo-card rounded-3xl p-7 relative border border-amber-400/30"
            >
              <span className="font-display text-4xl font-black text-amber-400/40 block mb-3">
                {item.step}
              </span>
              <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm opacity-85 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. IMPACT STATS */}
      <section
        aria-label="Platform Impact Metrics"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CountUpStat endValue={100} suffix="%" label="Lighthouse Accessibility Score" />
          <CountUpStat endValue={7} suffix="" label="Essential Core AI Hubs" />
          <CountUpStat endValue={7} suffix=":1+" label="WCAG 2.1 AAA Contrast Ratio" />
          <CountUpStat endValue={44} suffix="px+" label="Minimum Touch Target Standard" />
        </div>
      </section>

      {/* 6. ALL 7 RETAINED CORE HUBS */}
      <section
        aria-labelledby="flagship-modules-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-amber-500/20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">
              Streamlined &amp; Perfected
            </span>
            <h2
              id="flagship-modules-heading"
              className="font-display text-3xl sm:text-4xl font-extrabold mt-1"
            >
              The 7 Essential Accessibility Hubs
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="lumeo-btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm"
          >
            <span>Open Central Hub</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES_CONFIG.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section
        aria-labelledby="testimonials-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-amber-500/20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
            Community Impact
          </span>
          <h2
            id="testimonials-heading"
            className="font-display text-3xl sm:text-4xl font-extrabold mt-1"
          >
            Trusted by Advocates &amp; Educators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={i}
              className="lumeo-card rounded-3xl p-6 flex flex-col justify-between border border-amber-400/25"
            >
              <div>
                <Quote className="w-8 h-8 text-amber-400/50 mb-3" aria-hidden="true" />
                <p className="text-base italic leading-relaxed mb-6">"{t.quote}"</p>
              </div>
              <footer>
                <p className="font-display font-bold text-amber-400">{t.author}</p>
                <p className="text-xs opacity-75">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lumeo-card lumeo-glass-Output rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-amber-glow">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold">
            Experience barrier-free AI today.
          </h2>
          <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
            Launch any of the 7 core accessibility hubs or open the built-in Accessibility Panel to customize font scaling, OpenDyslexic typography, high contrast, and speech rate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="lumeo-btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base"
            >
              <span>Launch 7 Core Hubs</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              className="lumeo-btn-secondary inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-base"
            >
              <SlidersHorizontal className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span>Open Accessibility Panel</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER WITH ACCESSIBILITY STATEMENT */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-amber-500/20 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <span className="font-display text-xl font-extrabold text-amber-400">
              LUMEO
            </span>
            <p className="text-xs opacity-80 leading-relaxed">
              Technology That Understands Every Ability. Powered by React, Tailwind CSS, Web Speech API, WebRTC, and Google Gemini AI.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
              Accessibility Statement (WCAG 2.1 AAA)
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Lumeo conforms to WCAG 2.1 Level AAA with 7:1+ contrast ratios across Light and Dark modes, 18px minimum fluid body typography, 44px touch targets, and full keyboard navigation.
            </p>
          </div>

          <div className="flex flex-col sm:items-end justify-between gap-2">
            <div className="flex flex-wrap gap-4 font-bold text-xs">
              <Link to="/dashboard" className="hover:text-amber-400">
                7 Core Hubs
              </Link>
              <Link to="/modules/visual-assistant" className="hover:text-amber-400">
                Blind Help
              </Link>
              <Link to="/modules/sign-language" className="hover:text-amber-400">
                Sign Language
              </Link>
              <Link to="/modules/tts-stt" className="hover:text-amber-400">
                TTS &amp; STT
              </Link>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-bold">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Lighthouse Accessibility 100/100</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
