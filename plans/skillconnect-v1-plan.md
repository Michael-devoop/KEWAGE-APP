# SkillConnect — v1 Construction Plan

Status: draft for approval
Scope: scaffold + starter vertical slices (client, worker, offers, chat)
Source of truth: SRS v1.0 (provided) + repo inspection on 2026-11-07

---

## 1. Inputs and skills used

| Skill | Used for |
| --- | --- |
| `blueprint` | One-PR-sized phases, dependency order, cold-start context per phase |
| `frontend-design-direction` | Design contract, state matrix, anti-slop rules, rendered finish gate |
| `nextjs-turbopack` | Next.js 16 conventions (Turbopack, `proxy.ts`, async `params`) |
| `api-design` | Resource naming, status codes, error envelope |
| `react-testing` / `e2e-testing` | Vitest + RTL unit/component tests, Playwright smoke flows |
| `verification-loop` | Build, typecheck, lint, test, diff review before "done" |
| `backend-patterns` / `postgres-patterns` | Repository boundaries, atomic assignment, future Prisma schema |
| `security-review` | Session, ownership checks, SMS token hygiene, no PII in logs |

---

## 2. Current repo audit

Already present:

- pnpm workspace (`apps/*`, `packages/*`), Next.js `16.4.5`, React 19, Tailwind v4, shadcn `radix-luma`
- Route shells for public / client / worker / offer landing
- `components/ui/*` primitives, `cn` helper
- `@skillconnect/domain`: types, statuses, Zod schemas (phone, job, profile, rating, message)
- `@skillconnect/api`: empty `client.ts`, `mock.ts`
- Empty feature folders (`auth`, `jobs`, `offers`, `chat`, `availability`, `live`)

Missing vs. stated stack:

- TanStack Query, next-intl, Leaflet/react-leaflet, Vitest/RTL, Playwright
- Providers, i18n messages, API route handlers, repository layer, seed data
- Real page content, forms, chat, offer countdown, maps, tests

---

## 3. Architecture decisions (ADRs)

| # | Decision | Rationale |
| --- | --- | --- |
| A1 | **Monorepo stays**: `apps/web`, `packages/domain`, `packages/api` | Domain rules are pure and testable; web stays thin |
| A2 | **Domain is framework-free** (`matching`, `transitions`, `schemas`) | Match/rank logic must be unit-tested without Next |
| A3 | **Repository interface + in-memory adapter now, Prisma later** | Starter runs with zero infra; swap adapter without touching routes |
| A4 | **Route handlers are the single HTTP API** | TanStack Query, future mobile client, and tests share one contract |
| A5 | **RSC fetches read-only data directly via `@skillconnect/api`; client mutations use HTTP** | Avoids an unnecessary network hop on first paint |
| A6 | **Atomic assignment contract** | `assignIfSearching(jobId, workerId, offerId)` must be compare-and-set. In-memory: sync check. Postgres: `UPDATE ... WHERE status='SEARCHING' RETURNING *` |
| A7 | **i18n without URL locale segment** | Keeps current routes; locale from `NEXT_LOCALE` cookie. `en` default, `am` added |
| A8 | **Live updates = SSE + in-memory bus** | NFR-05. Single-instance starter; Postgres `LISTEN/NOTIFY` or Redis pub/sub later |
| A9 | **SMS behind `SmsProvider`** | Console provider in dev; provider SDK (Twilio/aggregator) later. SMS delivery ≠ read (SRS) |
| A10 | **Sequential offers with configurable timeout** | Max 10 candidates, 5 min default, next-on-reject/expire |
| A11 | **Settings in one config module** | Business rules change without code search |

---

## 4. Business rules — recommended defaults (confirm before Phase 4)

| Rule | Default | Change point |
| --- | --- | --- |
| Worker evaluation | Profile + skills self-declared; `assessmentStatus: UNVERIFIED`; verified via an in-app skills assessment later | `packages/domain/src/assessment.ts` |
| Ranking formula | skill coverage 30, proximity 25, rating 20, response rate 15, experience 10 (0–100) | `matching-config.ts` |
| Search radius | 10 km | `matching-config.ts` |
| Offer timeout | 5 minutes | `matching-config.ts` |
| Candidates per job | 10 | `matching-config.ts` |
| All candidates exhausted | job → `EXPIRED`, client notified | `offer-engine.ts` |
| Cancellable statuses | `SEARCHING`, `ASSIGNED` | `status.ts` |
| Who changes status | client: cancel / rate; worker: start / complete; system: search/assign/expire | `status.ts` guards |
| SMS read proof | None; SMS is delivery only | documented, no read receipts |

---

## 5. Design direction (frontend-design-direction)

- **Purpose:** post a job in under a minute; accept an offer from a phone in under 10 seconds.
- **Audience:** phone-first clients (non-technical) and workers on the move.
- **Tone:** utilitarian, trustworthy, warm field-service. Not a marketing landing page.
- **Palette:** deep teal primary, warm off-white surface, amber for time-critical offers, ink foreground. No purple gradients, no decorative blobs.
- **Memorable detail:** a single "job rail" status line plus a countdown ring on offers.
- **Layout:** mobile-first; bottom nav on small screens, top bar + content column on desktop.
- **Tokens:** CSS variables in `globals.css` (`--primary`, `--accent`, `--surface-*`, status tokens).
- **State matrix:** loading (skeletons), empty (copy + next action), error (retry), partial (list + inline warning), success (toast + next action), permission (role boundary).

Target viewports: `390x844`, `1440x900`.

---

## 6. Data model (in-memory now, Prisma later)

```
User(id, name, phone, role, passwordHash, createdAt)
WorkerProfile(userId, skills[], experienceYears, about, location, availableNow,
              assessmentStatus, ratingAvg, ratingCount, completedJobs,
              responseRate, lastActiveAt)
Job(id, clientId, title, description, skills[], location, status,
    assignedWorkerId?, createdAt, updatedAt, rated, cancelledBy?, cancelReason?)
Offer(id, jobId, workerId, token, rank, score, status,
      sentAt, expiresAt, respondedAt?, smsAttempts)
Message(id, jobId, senderId, senderRole, text, clientId, sentAt)
JobEvent(id, jobId, type, actorId?, payload, createdAt)   // audit
SmsLog(id, to, template, payload, providerId?, status, attempts, error?, createdAt)
```

---

## 7. Matching and offer engine

```
rankWorkers(job, workers, config) -> ScoredWorker[]
  eligible: availableNow && all required skills && distance <= radius && role=worker
  score = 30*coverage + 25*(1 - d/radius) + 20*bayesRating
        + 15*responseRate + 10*experience
  tie-break: distance asc, lastActiveAt desc, id asc

startSearch(jobId)
  -> candidates = rankWorkers(...).slice(0, 10)
  -> create PENDING offers with rank + deadline
  -> sendOffer(rank 1)

onReject(offer) | onExpire(offer)
  -> mark offer, reset job to SEARCHING
  -> sendOffer(next rank) or EXPIRED if none

onAccept(offer)
  -> assignIfSearching(job, worker, offer)   // atomic, first wins
  -> mark other PENDING offers CLOSED
  -> notify client via SMS
  -> event: JOB_ASSIGNED
```

Invariants:
- Exactly one worker per job (NFR-04)
- Offer status monotonic: `PENDING → ACCEPTED | REJECTED | EXPIRED | CLOSED`
- Job transitions only through `status.ts` guards (NFR-20)
- Every offer send/expire/accept and status change writes `JobEvent` (NFR-21/NFR-07)

---

## 8. API surface (route handlers)

| Method | Path | Role |
| --- | --- | --- |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | any |
| GET | `/api/auth/session` | any |
| GET | `/api/jobs` | client/worker |
| POST | `/api/jobs` | client |
| GET | `/api/jobs/:id` | owner/assigned worker |
| POST | `/api/jobs/:id/cancel` | client |
| POST | `/api/jobs/:id/start` | assigned worker |
| POST | `/api/jobs/:id/complete` | assigned worker |
| POST | `/api/jobs/:id/rating` | client |
| GET/POST | `/api/jobs/:id/messages` | owner/assigned worker |
| GET | `/api/jobs/:id/events` | owner/assigned worker (SSE) |
| GET | `/api/offers/:token` | public by token |
| POST | `/api/offers/:token/accept` | public by token |
| POST | `/api/offers/:token/reject` | public by token |
| GET/PATCH | `/api/worker/profile` | worker |
| PATCH | `/api/worker/availability` | worker |
| GET | `/api/skills` | public |

Error envelope: `{ ok: false, code, message }` with 400/401/403/404/409/410/503.

Ownership rule: jobs are visible only to the owning client, the assigned worker, or a worker holding a live offer token.

---

## 9. Folder structure (target)

```
apps/web/
  app/
    providers.tsx                     QueryClient, i18n, theme, toaster
    layout.tsx                        root shell
    api/...                           route handlers (table above)
    (public)/                         landing, login, register
    (client)/client/layout.tsx        role shell + bottom nav
    (client)/client/{jobs,jobs/new,jobs/[id],account}
    (worker)/worker/layout.tsx        role shell + availability
    (worker)/worker/{page,profile,jobs/[id]}
    o/[token]/                        SMS offer landing
  components/
    layout/{app-header,bottom-nav,role-shell}
    jobs/{job-card,status-badge,skill-chips,job-map}
    offers/offer-countdown.tsx
    chat/{chat-panel,message-list,message-composer}
  features/
    auth/{actions.ts,components}
    jobs/{actions.ts,queries.ts,components}
    offers/{actions.ts,queries.ts,components}
    chat/{actions.ts,hooks/useChat.ts,components}
    availability/actions.ts
    live/hooks/useLiveJob.ts
  i18n/request.ts
  messages/{en,am}.json
  lib/{env,session,http,utils}
  proxy.ts
  vitest.config.ts
  playwright.config.ts
  e2e/smoke.spec.ts
  tests/setup.ts
packages/domain/src/{types,status,schemas,matching,matching-config,transitions,events,skills,index}
packages/api/src/{store,seed,repositories,sms,events,auth,index}
plans/
```

---

## 10. Phased build plan

### Phase 0 — Foundation (no business logic)
- Add TanStack Query, next-intl, leaflet/react-leaflet, Vitest/RTL/jsdom, Playwright
- `next.config.ts` intl plugin, `proxy.ts` cookie passthrough
- `app/providers.tsx`, i18n request config + messages, env example
- Design tokens + status badges
- **Exit:** `pnpm dev` renders styled shell in `en`/`am`; `pnpm typecheck` passes

### Phase 1 — Domain core (pure, TDD)
- `matching-config.ts`, `matching.ts` (haversine + score + rank)
- `transitions.ts` (permitted transitions per role)
- `events.ts` (event types)
- Unit tests for rank order, radius, skill eligibility, transitions
- **Exit:** `pnpm test` green; no Next imports in domain

### Phase 2 — Data + offer engine
- `store.ts` (globalThis singleton), `seed.ts`, `repositories.ts`
- `offer-engine.ts` (start/next/accept/reject/expire, atomic assign)
- `sms.ts` console provider, `events.ts` bus
- Unit tests: first-accept-wins, next-on-reject, expired job
- **Exit:** engine tests green; audit rows written

### Phase 3 — Auth + guarded API
- `lib/session.ts` (HMAC cookie), `lib/http.ts` (envelope, guards)
- Auth routes, session route, register/login pages with RHF + Zod
- Job/worker/offer/message/event routes
- **Exit:** role and ownership rules enforced; 401/403 covered by tests

### Phase 4 — Client vertical slice
- Post job form (RHF + Zod + map picker), job list, job detail, cancel, rate
- TanStack Query hooks + optimistic status updates
- **Exit:** client can post → see SEARCHING → see assignment → cancel/rate

### Phase 5 — Worker vertical slice
- Profile form, availability toggle, offer list, assigned job start/complete
- **Exit:** worker can go available → accept offer → start → complete

### Phase 6 — Offer landing + SMS flow
- `/o/[token]` public page with server-time countdown, accept/reject
- Console SMS provider logs offer URL; sequential dispatch on reject/expire
- **Exit:** token page works signed-out; no login required; expired token shows 410

### Phase 7 — Chat + live updates
- Messages route, SSE events route, `useLiveJob`, chat panel
- **Exit:** both parties see messages within 1s; non-participants get 403

### Phase 8 — Maps + polish
- Lazy Leaflet map (dynamic `ssr:false`), OSM tiles, no API key
- Empty/loading/error/partial states, a11y pass, i18n coverage
- **Exit:** map never blocks first paint; keyboard + focus checks pass

### Phase 9 — Verification
- Vitest + RTL component tests (forms, countdown, status badge)
- Playwright: register → post job → offer accept → chat → complete → rate
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- Rendered finish gate at `390x844` and `1440x900`
- **Exit:** all gates green; artifacts saved under `apps/web/test-results/`

---

## 11. Testing strategy

| Layer | Tool | What |
| --- | --- | --- |
| Domain | Vitest | scoring, eligibility, transitions, offer engine, atomicity |
| API | Vitest + route handlers | auth, ownership, 409 conflicts, 410 expiry |
| UI | Vitest + RTL | form validation, countdown, status badges |
| E2E | Playwright | two-role happy path + offer expiry path |

Determinism: inject `now`, `ids`, and `sms` into the engine; no `Date.now()` in tests.

---

## 12. Risks / open items

- **Business rules unconfirmed** (Section 4) — defaults are config-driven.
- **Password reset / OTP** not in SRS; registration uses password. Confirm.
- **SMS provider** not chosen; console adapter is dev-only.
- **Concurrency:** in-memory atomicity is process-local. Postgres adapter must use a conditional update before production.
- **i18n:** `am` catalog starts with high-traffic strings only.
- **Leaflet SSR:** must stay behind `next/dynamic` with `ssr:false`.
- **Next 16:** typed `PageProps`, async `params`, `proxy.ts` (not `middleware.ts`).
