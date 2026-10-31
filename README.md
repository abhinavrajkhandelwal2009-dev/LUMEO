# LUMEO – Technology That Understands Every Ability

LUMEO is a flagship, WCAG 2.1 Level AAA compliant AI accessibility platform designed with a luminous, warm-human aesthetic. It unifies **7 perfected multimodal accessibility hubs** powered by **React, Tailwind CSS, Framer Motion, Web Speech APIs, WebRTC (`getUserMedia`), Supabase (PostgreSQL + RLS), and Google Gemini (`@google/genai`)**.

---

## Luminous Design System & Customization Tokens

All design tokens live in [`frontend/tailwind.config.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/tailwind.config.js) and [`frontend/src/index.css`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/src/index.css) (and mirrored in [`client/`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client)):

### 1. Color Palette (7:1+ WCAG AAA Contrast in Both Themes)
- **Obsidian Dark Theme (`html.dark`)**:
  - `--bg-primary`: `#0B0C14` (Deep Obsidian Indigo)
  - `--bg-secondary`: `#121526` (Midnight Surface)
  - `--text-primary`: `#FAF7F0` (Warm Cream — 17.8:1 contrast against `#0B0C14`)
  - `--accent-amber`: `#FBBF24` (Warm Luminous Gold Light Accent)
  - `--accent-teal`: `#2DD4BF` (Soft Teal Secondary Accent)
- **Warm Daylight Theme (`html` light)**:
  - `--bg-primary`: `#FAF7F0` (Warm Cream Base)
  - `--text-primary`: `#0F121D` (Deep Ink — 17.8:1 contrast)
  - `--accent-amber`: `#B45309` / `#D97706`
- **Ultra High-Contrast Override (`body.high-contrast-mode`)**:
  - Pure `#000000` background, `#FFFFFF` text, and `#FACC15` 2px borders (19.5:1 contrast).

### 2. Typography & Fluid Scaling
- **Display Font**: `Fraunces` (expressive editorial serif for headings)
- **Body Font**: `Atkinson Hyperlegible` & `Inter` (engineered by the Braille Institute for low-vision legibility; minimum `18px` base size)
- **Dyslexia Font**: `OpenDyslexic` (toggled via the built-in Accessibility Panel)

---

## The 7 Essential Accessibility Hubs

Every active module includes a prominent, high-contrast **Output Box** with built-in **Read Aloud (`window.speechSynthesis`)** and **Copy** controls:

1. **AI Sign Language & Gesture Translator** (`/modules/sign-language`) — Live webcam hand landmark scanner (`getUserMedia`), frame snapshot capture, and simulated gesture pad (ASL/BSL/ISL) that outputs translated sentences into the Output Box and automatically triggers spoken TTS audio.
2. **Smart Visual & Surroundings Assistant (Blind Help)** (`/modules/visual-assistant`) — Continuous live camera stream analysis (periodic 4-second canvas frame snapshots) guiding blind and low-vision users through physical objects using clock-face directions (`12 o'clock`, `2 o'clock`, `10 o'clock`) and spoken hazard alerts.
3. **Text-to-Speech & Speech-to-Text Studio** (`/modules/tts-stt`) — Continuous `webkitSpeechRecognition` live captioning into a high-contrast Output Box, plus natural TTS document narration with speed and pitch sliders.
4. **AI Translator & Global Communication** (`/modules/translator`) — Multilingual plain-language translation with phonetic guides and spoken Output Box.
5. **Dyslexia Reading & Cognitive Canvas** (`/modules/dyslexia-reader`) — Rewrites complex text into cognitive chunks with **Bionic first-letter bolding**, adjustable letter/line spacing, and Irlen color overlays.
6. **Accessible Education & Document Explainer** (`/modules/education`) — Parses study notes or uploaded `.txt`/`.md` documents into step-by-step explanations and analogies.
7. **Emergency SOS & First Responder Hub** (`/modules/emergency`) — One-tap emergency cards with a **Fullscreen Responder Mode (`911 / 112 / 999`)** and loud automated voice broadcast.

---

## Backend API Endpoints ([`backend/routes/aiRoutes.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/routes/aiRoutes.js))
- `POST /api/ai/sign-language` — Translates webcam gesture frames or sign sequences.
- `POST /api/ai/visual-assist` — Analyzes base64 camera frames via `gemini-2.5-flash` for spatial orientation.
- `POST /api/ai/dyslexia-simplify` — Simplifies complex reading passages.
- `POST /api/ai/text-enhance` — Punctuates and summarizes STT transcripts.
- `POST /api/ai/process` — Unified multimodal AI endpoint.
