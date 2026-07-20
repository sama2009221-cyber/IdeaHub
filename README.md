# IdeaHub 💡

> Internal Idea Evaluation Platform — AI-assisted scoring, peer review, RAG chatbot

## Architecture

```
smart_idea/
├── idea-hub-api/    # FastAPI (Python) — REST API + AI pipeline
├── idea-hub-web/    # Next.js 14 — Web frontend (TypeScript + Tailwind)
└── idea-hub-mobile/ # Expo (React Native) — Mobile app
```

## Quick Start

### 1. Start the database

```bash
cd idea-hub-api
docker-compose up db -d   # starts pgvector/pgvector:pg16 on port 5432
```

### 2. Run the API

```bash
cd idea-hub-api
cp .env.example .env
# Edit .env — set IDEAHUB_GROQ_API_KEY to your Groq API key

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

### 3. Run the web frontend

```bash
cd idea-hub-web
npm install
npm run dev
```

Web app: http://localhost:3000

### 4. Run the mobile app

```bash
cd idea-hub-mobile
npm install
npx expo start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan QR code with Expo Go.

---

## Docker (full stack)

```bash
cd idea-hub-api
cp .env.example .env
# Set IDEAHUB_GROQ_API_KEY
docker-compose up --build
```

---

## Environment Variables

See [idea-hub-api/.env.example](./idea-hub-api/.env.example) for all `IDEAHUB_*` variables.

**Required:**
- `IDEAHUB_GROQ_API_KEY` — Get free key at https://console.groq.com
- `IDEAHUB_JWT_SECRET` — Change before production (any 32+ char string)
- `IDEAHUB_DATABASE_URL` — PostgreSQL + pgvector connection string

**Optional:**
- `IDEAHUB_EMAIL_ENABLED=true` + SMTP vars for real email notifications
- `IDEAHUB_ALLOWED_EMAIL_DOMAIN` — e.g. `company.com` to restrict registration

---

## Features

| Feature | Status |
|---|---|
| JWT Auth (register/login/refresh) | ✅ |
| Idea CRUD + version history | ✅ |
| File attachments | ✅ |
| Evaluator assignment | ✅ |
| Numeric ratings (configurable rubric) | ✅ |
| Comments + suggested edits | ✅ |
| AI Evaluation (Groq) — auto on submit | ✅ |
| Embeddings (sentence-transformers, local) | ✅ |
| RAG chatbot — per-idea + cross-idea | ✅ |
| In-app notifications | ✅ |
| Email notifications (optional SMTP) | ✅ |
| Admin panel (users + rubric) | ✅ |
| Mobile app (Expo) | ✅ |
| Push notifications (FCM) | 🔧 scaffold |

---

## AI Layer

- **Inference**: Groq (`llama-3.3-70b-versatile`) via OpenAI-compatible API
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384-dim, runs locally)
- **Vector store**: PostgreSQL + pgvector (HNSW index)
- **RAG**: access-scoped retrieval → Groq completion → cited answer

System prompts are versioned files in `idea-hub-api/prompts/`:
- `evaluation.txt` — strict JSON output schema
- `rag_chat.txt` — context-only answers with citation enforcement

---

## Data Model

| Table | Purpose |
|---|---|
| `users` | Auth + role + department |
| `ideas` | Idea metadata + status |
| `idea_versions` | Immutable version history |
| `rubric_dimensions` | Admin-configurable rating dimensions |
| `evaluator_assignments` | Many-to-many idea ↔ evaluator |
| `ratings` | Per-dimension scores (upsertable) |
| `comments` | Free-text + structured suggested edits |
| `ai_evaluations` | Per-version AI scores + notes (immutable history) |
| `embeddings` | pgvector (384-dim) chunks with HNSW index |
| `notifications` | In-app notification feed |

---

## Default Admin Account

Register normally — the **first user** gets role `owner`. Promote to `admin` via direct DB:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or use the admin API with an existing admin token.
