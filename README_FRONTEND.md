# MicroCourse Frontend (Sellable Build)

## What this includes
- Next.js App Router UI
- Auth (register/login) with token storage
- Course catalog + course detail
- Quiz player + submit
- Production-safe API client (token headers + timeout + retry)
- Next proxy route: /api/* -> BACKEND /api/* using API_BASE_URL

## Configure
- Copy .env.example to .env.local (already created if missing)
- Ensure backend is running at API_BASE_URL (default: http://localhost:11001)

## Run
npm install
npm run dev

Open:
- http://localhost:3000/courses
- http://localhost:3000/login
- http://localhost:3000/register
- http://localhost:3000/dashboard (protected)