import {
  Hand,
  Eye,
  Volume2,
  Languages,
  BookOpen,
  GraduationCap,
  Siren,
} from 'lucide-react';

export const MODULE_CATEGORIES = [
  'All 7 Core Hubs',
  'Vision & Blind Guidance',
  'Hearing, Speech & Sign',
  'Cognitive, Reading & Education',
  'Emergency & Global',
];

export const MODULES_CONFIG = [
  {
    id: 'sign-language',
    number: 1,
    title: 'AI Sign Language & Gesture Translator',
    shortTitle: 'Sign Language Scanner',
    route: '/modules/sign-language',
    category: 'Hearing, Speech & Sign',
    icon: Hand,
    shortcut: 'Alt+1',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-400/40',
    description:
      'Live webcam hand gesture scanner (ASL, BSL, ISL) with snapshot capture, interactive gesture pad, dedicated Output Box, and automatic Text-to-Speech playback.',
  },
  {
    id: 'visual-assistant',
    number: 2,
    title: 'Smart Visual & Surroundings Assistant (Blind Help)',
    shortTitle: 'Blind Live Camera Help',
    route: '/modules/visual-assistant',
    category: 'Vision & Blind Guidance',
    icon: Eye,
    shortcut: 'Alt+2',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-400/40',
    description:
      'Continuous live camera stream analysis (every 3–5s) guiding blind and low-vision users through physical objects with clock-face spatial orientation and spoken hazard alerts.',
  },
  {
    id: 'tts-stt',
    number: 3,
    title: 'Text-to-Speech & Speech-to-Text Studio',
    shortTitle: 'TTS & Live STT Studio',
    route: '/modules/tts-stt',
    category: 'Hearing, Speech & Sign',
    icon: Volume2,
    shortcut: 'Alt+3',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-400/40',
    description:
      'Dual-tab studio featuring continuous Speech-to-Text (STT) live high-contrast captioning and natural Text-to-Speech (TTS) document narration with speed/pitch sliders.',
  },
  {
    id: 'translator',
    number: 4,
    title: 'AI Translator & Global Communication',
    shortTitle: 'Global AI Translator',
    route: '/modules/translator',
    category: 'Emergency & Global',
    icon: Languages,
    shortcut: 'Alt+4',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-400/40',
    description:
      'Translates text or spoken voice across global languages with plain-language adaptations, phonetic guides, and an instant spoken Output Box.',
  },
  {
    id: 'dyslexia-reader',
    number: 5,
    title: 'Dyslexia Reading & Cognitive Canvas',
    shortTitle: 'Dyslexia Cognitive Reader',
    route: '/modules/dyslexia-reader',
    category: 'Cognitive, Reading & Education',
    icon: BookOpen,
    shortcut: 'Alt+5',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-400/40',
    description:
      'Rewrites complex articles into dyslexia-friendly cognitive chunks with bionic first-letter bolding, OpenDyslexic font, wide line spacing, and Irlen color overlays.',
  },
  {
    id: 'education',
    number: 6,
    title: 'Accessible Education & Document Explainer',
    shortTitle: 'Education & Doc Explainer',
    route: '/modules/education',
    category: 'Cognitive, Reading & Education',
    icon: GraduationCap,
    shortcut: 'Alt+6',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-400/40',
    description:
      'Parses study notes, textbooks, or uploaded documents into step-by-step explanations with real-world analogies, glossaries, and a dedicated spoken Output Box.',
  },
  {
    id: 'emergency',
    number: 7,
    title: 'Emergency SOS & First Responder Hub',
    shortTitle: 'Emergency SOS Hub',
    route: '/modules/emergency',
    category: 'Emergency & Global',
    icon: Siren,
    shortcut: 'Alt+7',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-400/50',
    description:
      'Quick-action medical and speech emergency card generator with high-visibility fullscreen responder mode (911 / 112 / 999) and loud automated spoken alerts.',
  },
];
