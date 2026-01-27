# FastAPI Recommendation Backend

This backend connects to your **Supabase Postgres** database (same tables used by Prisma) and provides three algorithms:

- **content**: TF‑IDF similarity over film metadata (title/director/genre/year)
- **collab**: item‑item collaborative filtering using co‑likes across users
- **hybrid**: weighted blend of content + collab (alpha from env, default 0.5)

## Setup

1) Create `backend/env` (no dot-file in this repo) from the example:

```bash
cp backend/env.example backend/env
```

2) Fill `DATABASE_URL` inside `backend/env` using your Supabase **direct** Postgres connection string.

3) Install deps and run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /admin/rebuild` (reload films + likes into memory)
- `GET /recommendations/user/{user_id}?algorithm=content|collab|hybrid&k=20`
- `GET /recommendations/similar/{film_id}?algorithm=content|collab|hybrid&k=20`

## Notes

- This MVP keeps recommendation indices **in memory**. When likes/films change a lot, call `POST /admin/rebuild`.
- Tables expected (from your Prisma schema mapping):
  - `public.films`
  - `public.user_film_likes`

