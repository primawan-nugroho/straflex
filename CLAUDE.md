@AGENTS.md
# Straflex Project Rules (The Redesign)

## 1. Project Context & Vibe
Straflex is a premium, minimalist fitness visualization tool. It transforms Strava data into "editorial-grade" social media assets.
- **Aesthetic:** minimalist aesthetic, "Material You" design
- **Design Principles:** High-contrast serif typography, generous white space, muted analog color palettes, and smooth Framer Motion transitions.
- **Goal:** Total redesign from the legacy codebase to a modern, high-end visual experience.

## 2. Tech Stack Constraints
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Animations:** Framer Motion (use for layout transitions and "feel").
- **Charts:** Recharts (customized to look like static editorial infographics).
- **Backend/DB:** Next.js API Routes, Prisma ORM, PostgreSQL (Neon).
- **Auth:** NextAuth.js (Strava OAuth).
- **Caching:** Redis (Upstash) for session/API rate limiting.
- **Export:** HTML Canvas API / html2canvas.

## 3. Core Features & Architecture
### A. The "Demo Mode" (Introduction)
- Always provide a "Try with Demo Data" path that bypasses Strava OAuth.
- Use a mock activity object that mirrors the Strava API schema to ensure a seamless transition to real data.

### B. Visualization Engine
- **IG Story Mode:** show various combination activities data, transparent background options.
- **Editorial Mode:** 1:1 or 4:5 aspect ratio, opaque with premium typography.
- **Logic:** Components must be "Export-Ready." Avoid CSS filters that `html2canvas` cannot render; prefer SVG and inline styles for canvas fidelity.

### C. Data Flow
- Strava API -> Server Action/API Route -> Prisma (Storage) -> Client (Recharts).

## 4. Coding Standards (TypeScript First)
- **Strict Typing:** No `any`. Use Zod for schema validation (especially for Strava API responses).
- **Components:** Functional components only. Use `lucide-react` for iconography.
- **Style:** Tailwind classes should follow a logical order. Use `cn()` utility for conditional classes.
- **Directory Structure:**
  - `/components/ui`: Shared primitive components (Shadcn-style).
  - `/components/viz`: Specific visualization templates.
  - `/lib`: Prisma client, Strava API utilities, and formatting helpers.

## 5. Workflow Commands
- **Build:** `npm run build`
- **Dev:** `npm run dev`
- **Lint:** `npm run lint`
- **DB Sync:** `npx prisma generate && npx prisma db push`

## 6. Redesign Protocol
- When refactoring legacy code:
  1. Read the old logic/types.
  2. Create a NEW component in the modern style.
  3. Map existing data props to the new UI.
  4. Only delete the old file once the new version is verified.
