# LUMEO – Technology That Understands Every Ability

LUMEO is a unified, end-to-end WCAG 2.1 AA/AAA compliant AI accessibility platform structured into **3 separate systems** (`client` / `frontend`, `server`, and `backend`) with dedicated **Supabase** and **Render / Vercel** deployment configurations.

---

## 3-System Architecture Overview

1. **Client System ([`frontend/`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend) & [`client/`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client)) — Vercel Link-Up Only**
   - Built with React, Vite, Tailwind CSS, Lucide React, Web Speech API, and HTML5 Canvas.
   - Configured specifically for **Vercel** via [`frontend/vercel.json`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/vercel.json) and [`client/vercel.json`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client/vercel.json), routing `/api/*` traffic to the Render backend (`https://lumeo-backend.onrender.com/api`).
   - Uses [`frontend/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/.env), [`frontend/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/.env.supabase), and [`frontend/src/config/supabase.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/src/config/supabase.js) with `VITE_SUPABASE_SERVICE_URL` and `VITE_SUPABASE_ANON_KEY`.

2. **Server System ([`server/`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server)) — Dedicated API Gateway & Orchestrator**
   - Standalone Express gateway ([`server/index.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/index.js)) that bridges requests between the Vercel Client, Supabase ([`server/config/supabaseClient.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/config/supabaseClient.js)), and the Render Backend.
   - Environment files: [`server/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/.env) and [`server/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/.env.supabase).

3. **Backend System ([`backend/`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend)) — Render + Supabase + Google Gemini AI**
   - Connects to **both Supabase and Render** ([`backend/render.yaml`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/render.yaml) and root [`render.yaml`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/render.yaml)).
   - Uses `SUPABASE_SERVICE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL` in [`backend/config/supabase.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/config/supabase.js) and [`backend/config/db.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/config/db.js).
   - Executes all 15 accessibility AI modules via `@google/genai` (`GEMINI_API_KEY` isolated strictly on the backend).

---

## Dedicated Environment & Supabase Files

| System | Standard Env File | Dedicated Supabase Env File | Supabase Code / SQL File |
| :--- | :--- | :--- | :--- |
| **Root** | [`.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/.env) | [`.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/.env.supabase) | [`render.yaml`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/render.yaml) |
| **Backend (Render + Supabase)** | [`backend/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/.env) | [`backend/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/.env.supabase) | [`backend/config/supabase.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/config/supabase.js), [`backend/config/supabase_schema.sql`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/config/supabase_schema.sql) |
| **Server (Gateway)** | [`server/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/.env) | [`server/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/.env.supabase) | [`server/config/supabaseClient.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/config/supabaseClient.js) |
| **Client (Vercel Only)** | [`frontend/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/.env), [`client/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client/.env) | [`frontend/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/.env.supabase), [`client/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client/.env.supabase) | [`frontend/src/config/supabase.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/src/config/supabase.js), [`client/supabase.js`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/client/supabase.js) |

---

## How to Connect Your Supabase Project

1. Open your Supabase project dashboard (`https://app.supabase.com`) and run [`backend/config/supabase_schema.sql`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/config/supabase_schema.sql) in the **SQL Editor** to create the `users` and `user_interactions` tables with Row-Level Security (RLS).
2. Paste your `SUPABASE_SERVICE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL` into:
   - [`backend/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/.env.supabase) (and [`backend/.env`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/backend/.env))
   - [`server/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/server/.env.supabase)
   - [`frontend/.env.supabase`](file:///c:/Users/khand/OneDrive/Desktop/Lumeo/frontend/.env.supabase) (Anon Key & Service URL only)
