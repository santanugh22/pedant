# Feedants Classical Dance — Full-Stack Competition Platform
## React Native (Expo) + Node.js/Express (TypeScript) + MongoDB

A functional, full-stack implementation of the **Feedants Competition Details Screen** ("Feedants Classical Dance"), engineered from the official technical assignment specification and high-fidelity design reference (`Design_Reference.png`).

---

## Quick Start (Turnkey Local Evaluation)

This codebase features an **automatic in-memory MongoDB replica set fallback** (`MongoMemoryReplSet`) and **in-memory Redis fallback**. You do not need to configure an external MongoDB replica set or Redis to run and evaluate the full application immediately!

### 1. Prerequisites
- **Node.js**: v20+ LTS or v22/v24 LTS
- **npm**: v10+

### 2. Backend Setup & Seeding

```bash
cd backend
npm install
npm run seed      # Seeds demo users, reference competition, winners, and 5 distinct competition states
npm run dev       # Starts API server on http://localhost:4000 (with health check at /health)
```

### 3. Frontend Setup (Expo App)

```bash
cd app
npm install
npx expo start    # Press 'w' for Web, or scan QR code with Expo Go on iOS / Android
```

> **Testing on a Physical Device with Expo Go:**
> In `app/.env`, replace `localhost` in `EXPO_PUBLIC_API_BASE_URL` with your computer's local Wi-Fi IP address (e.g., `http://192.168.1.5:4000/api/v1`).

---

## Seeded Demo Accounts & Credentials

The seed script creates two primary accounts to immediately test different user states:

| Account Type | Email | Password | Pre-seeded Status & Expected UI |
|---|---|---|---|
| **Registered Participant** | `registered@feedants.com` | `password123` | **Confirmed & Paid** for "Feedants Classical Dance". Displays the **✓ Registered** badge and **Upload Submission** CTA matching the reference screenshot! |
| **Fresh / New User** | `demo@feedants.com` | `password123` | **Unregistered**. Displays **Register Now – ₹99** CTA. Tap to test spot reservation and the Razorpay payment checkout flow from scratch. |
| **Guest (Signed Out)** | *None* | *None* | Public view. No "Registered" badge. Tapping "Register Now" redirects to login and returns automatically upon authentication. |

---

## Automated Test Suite & Concurrency Proof

Run all test suites from the `backend/` directory:

```bash
cd backend

# Run all test suites (Unit, Integration, Concurrency)
npm test

# Run individual test suites
npm run test:unit           # Pure state machine & 12-row CTA decision table tests
npm run test:integration    # End-to-end API integration tests
npm run test:concurrency    # 20 simultaneous users competing for 3 remaining spots
```

### Concurrency Stress Test Terminal Output

Below is the verified test run showing 20 concurrent registration requests fired simultaneously against a competition with exactly 3 spots left:

```text
> feedants-backend@1.0.0 test:concurrency
> jest tests/concurrency --runInBand

  console.log
    ================ CONCURRENCY TEST RESULTS ================
    Concurrent registration requests fired: 20
    Total spots initially available:        3
    Registrations succeeded:                 3
    Registrations rejected:                  17
    First failure reason: ConflictError: No spots are available for this competition
    ==========================================================

PASS tests/concurrency/registration-race.test.ts (6.304 s)
  Concurrency & Data Consistency: Registration Race Condition
    ✓ never overbooks a competition under concurrent registration attempts (20 users competing for 3 spots) (1702 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        8.018 s
```

**Key Guarantees Proven:**
1. Exactly `3` requests succeeded; `17` were cleanly rejected with `SPOTS_FULL_OR_CLOSED`.
2. `Competition.bookedSpots` was incremented atomically from 7 to strictly 10 (never 11 or higher).
3. Exactly 3 `Registration` records were created in the database.
4. Handled WiredTiger `WriteConflict` and `LockTimeout` via jittered backoff retries within ACID transactions.

---

## 1. Important Assumptions Made

1. **"Previous Winners" Model Past Editions of the Competition:**
   In the reference design, two separate performers both display the title "1st Winner". We model `PreviousWinner` documents referencing the competition series (`seriesKey: 'classical-dance-series'`) where each winner belongs to a past edition/season (e.g. Season 2, Season 3), rather than inventing an artificial rule for multiple simultaneous 1st places in a single run.
2. **"Registered" is Synonymous with "Paid":**
   Per Section 5.9's disclaimer ("Only contributions from paid participants will be considered for judging"), a `pending_payment` hold does not show the "Registered" badge and cannot submit an entry. Only `confirmed` (paid) registrations are considered fully registered.
3. **Overlapping, Independent Date Windows:**
   Registration and submission windows are modeled as independent boolean conditions, not sequential phases. As seen in the reference data, the submission window (starts 6 Aug) opens 4 days *before* registration ends (10 Aug).
4. **Spot Reservation at Checkout Initiation:**
   Spots are reserved atomically at the start of checkout (`pending_payment`) with a 15-minute hold TTL, rather than waiting until payment confirmation. If the user abandons payment, an automated cron sweep frees the spot.
5. **Centralized Server-Computed Lifecycle & CTA States:**
   All lifecycle flags (`registrationOpen`, `isFull`, `submissionOpen`, `resultsDeclared`) and CTA button states (label, sublabel, action, enabled) are computed strictly on the backend as pure functions and delivered to the client as data, preventing client/server business logic divergence.
6. **Public Browsing with Seamless Auth Hand-off:**
   Competition details are public. Guests can view the full details screen; tapping "Register Now" carries a `returnTo` parameter to `/login` and redirects back upon successful authentication.
7. **Storage Provider Switch (S3 vs Local):**
   Architected with direct-to-object-storage pre-signed S3 URLs as the production switch (`UPLOAD_PROVIDER=s3`), while defaulting to `UPLOAD_PROVIDER=local` for zero-friction local evaluation without requiring live AWS credentials.
8. **Language Toggle Scope:**
   The ENG / हिंदी pill toggle is fully functional for static UI strings via `i18next`. Dynamic competition content (title, description) remains in its authored language.
9. **Razorpay Standard Checkout via WebView:**
   Razorpay checkout is implemented using Standard Checkout in a WebView (Approach A), enabling the app to run directly in plain Expo Go without custom native dev clients or prebuilds.
10. **Submission Editing Allowed Before Deadline:**
    Participants who have uploaded a performance can re-upload/edit their submission until `dates.submissionEnd` arrives, satisfying Row 10 of the CTA state table.
11. **Stubs for Secondary Tabs:**
    Home, Explore, the central `+` FAB, and the Ad placeholder are minimal stubs as specified, keeping focus on the core Competition Details experience.

---

## 2. Major Technical Decisions

1. **End-to-End TypeScript:**
   Ensures complete type safety across Mongoose schemas, Zod request validators, API DTOs, and React Native components.
2. **Reservation-Then-Confirm Concurrency Model:**
   Uses an atomic `$inc` with `$expr: { $lt: ['$bookedSpots', '$totalSpots'] }` inside a MongoDB multi-document transaction to guarantee that overbooking is physically impossible at the database engine level.
3. **Server-Driven CTA State Machine:**
   The sticky bottom button logic is implemented as a pure function (`computeUserCta`) on the backend, verified by 14 unit test cases across all 12 rows of the decision matrix.
4. **Client Clock Drift Elimination:**
   The countdown timer is anchored to the server's clock via `serverTime` returned in `GET /competitions/:id`, ensuring countdown accuracy even if the client's device clock is incorrect.
5. **Decoupled Direct File Uploads:**
   Large video/photo files are uploaded directly to the storage target via pre-signed URLs or dedicated upload handlers rather than being proxied through core JSON API endpoints, preventing Node.js event-loop bottlenecks.
6. **Expo Router + TanStack Query + Zustand Stack:**
   File-based navigation with Expo Router, automatic background caching and focus-refetching with TanStack Query (guaranteeing spots-left consistency across concurrent users), and minimal global auth state with Zustand.

---

## 3. Trade-offs Considered

| Decision | Chosen Approach | Alternative Considered | Trade-off Rationale |
|---|---|---|---|
| **Spot Booking Model** | Reserve spot at checkout start with 15-minute hold TTL | Decrement spot only upon confirmed payment | The chosen reservation model prevents collecting money from two users for one spot (avoiding awkward refunds), in exchange for brief spot hold unavailability if a checkout is abandoned. |
| **Razorpay Integration** | Standard Checkout inside WebView | Native `react-native-razorpay` SDK | WebView checkout works seamlessly in plain Expo Go without native build steps, prioritizing ease of evaluation. The native SDK requires custom dev clients (`npx expo prebuild`). |
| **State Computation** | Centralized on backend, delivered as data | Derived independently in React Native components | Centralized calculation eliminates client/server logic drift and keeps the mobile app lightweight. |
| **Live Updates** | React Query background polling (20s) + refetch on focus | Full WebSocket / Socket.io live socket | Background polling and refetch-on-focus satisfy real-time spots consistency without the connection overhead and firewall issues of standing WebSockets. |
| **Media Storage** | Switchable driver (`UPLOAD_PROVIDER=local` vs `s3`) | S3-only requirement | Allows evaluators to test full video/image uploads without providing AWS access keys, while keeping production S3 code ready via configuration. |

---

## 4. What Would Be Improved for Production

1. **WebSocket / SSE Live Spot Feeds:**
   Implement Socket.io or Server-Sent Events (SSE) to push instant spot decrement events to all connected clients when hot competitions are near capacity.
2. **Full Production Authentication:**
   Add Google/Apple OAuth social sign-in, SMS OTP phone verification (e.g. Twilio), password reset with signed tokens, and biometrics via `expo-local-authentication`.
3. **Admin CMS & Competition Management:**
   Build a web-based administrative dashboard (e.g. Next.js + Tailwind) for competition creation, judge assignment, deadline adjustments, and submission review/scoring.
4. **Full Per-Locale Dynamic Content:**
   Extend the i18n system to support multi-language schema fields in MongoDB (e.g. `title: { en: "...", hi: "..." }`) so dynamic competition descriptions translate alongside UI strings.
5. **Automated Video Transcoding & HLS Streaming:**
   Integrate AWS MediaConvert or Cloudinary to automatically transcode raw user-submitted MP4/MOV videos into adaptive HLS (`.m3u8`) bitrates and auto-generate preview thumbnails.
6. **Infrastructure & Observability:**
   Deploy with Kubernetes/ECS behind an Application Load Balancer, configured with read replicas, Datadog/Prometheus metrics, Sentry error tracking, and automated CI/CD pipelines.

---

## Architecture & Monorepo Structure

```
feedants-competition/
├── backend/
│   ├── src/
│   │   ├── config/             # DB (with replica set fallback), Redis, Razorpay, Environment
│   │   ├── models/             # User, Competition, Registration, Payment, Submission, PreviousWinner, Testimonial, Referral
│   │   ├── services/           # lifecycleService, registrationService, competitionService, submissionService, referralService
│   │   ├── controllers/        # Express HTTP controllers
│   │   ├── routes/             # auth, competitions, payments, referrals, webhooks
│   │   ├── middlewares/        # requireAuth, optionalAuth, validate, errorHandler, rateLimiter
│   │   ├── validators/         # Zod schemas
│   │   ├── utils/              # errors, response envelope, jwt, codeGenerator
│   │   ├── jobs/               # Expiry sweep cron job for unpaid spot holds
│   │   ├── seed/               # Comprehensive seed script (5 competition states & demo users)
│   │   ├── app.ts              # Express configuration & security middlewares
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── tests/
│   │   ├── unit/               # Lifecycle & CTA 12-row decision table unit tests
│   │   ├── integration/        # Supertest API endpoint integration tests
│   │   └── concurrency/        # Concurrency race test (20 requests for 3 spots)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── app/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── (auth)/
│   │   │   ├── login.tsx       # Sign-in with 1-tap demo shortcuts
│   │   │   └── signup.tsx      # Sign-up with referral code attribution
│   │   ├── (app)/
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx # Bottom tab bar with center raised FAB
│   │   │   │   ├── home.tsx
│   │   │   │   ├── explore.tsx
│   │   │   │   ├── create.tsx
│   │   │   │   ├── competitions.tsx # Competitions list
│   │   │   │   └── profile.tsx      # User profile & logout
│   │   │   ├── competitions/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── index.tsx        # ★ Competition Details Screen
│   │   │   │   │   ├── testimonials.tsx # Testimonials list
│   │   │   │   │   └── submit.tsx       # Media picker & upload flow
│   ├── src/
│   │   ├── components/
│   │   │   ├── competition-details/     # ScreenHeader, CompetitionInfoCard, JudgeCard, CountdownBanner, ImportantDatesCard, PreviousWinnersCarousel, CompetitionTabs, RewardsCard, DisclaimerBanner, InfoRow, ReferEarnCard, TestimonialsLinkRow, AdPlaceholder, StickyBottomCta
│   │   │   └── common/                  # Card, Chip, VideoModal, RazorpayCheckoutModal, Skeleton, ErrorState
│   │   ├── api/                         # Axios client with JWT interceptor and typed endpoints
│   │   ├── hooks/                       # useCompetition, useCountdown, useRegister, useVerifyPayment, useSubmitEntry
│   │   ├── store/                       # Zustand authStore with SecureStore
│   │   ├── constants/                   # Theme tokens matching Design_Reference.png
│   │   ├── i18n/                        # English and Hindi dictionary files
│   │   └── utils/                       # Currency, IST dates, zero-padding formatters
│   ├── app.json
│   ├── .env.example
│   └── package.json
├── docker-compose.yml                   # Optional local Mongo (rs0) & Redis services
└── README.md
```

---

## Environment Variables Reference

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=4000
API_BASE_PATH=/api/v1
MONGODB_URI=mongodb://127.0.0.1:27017/feedants?replicaSet=rs0
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=feedants_jwt_access_secret_key_2026_dev
JWT_REFRESH_SECRET=feedants_jwt_refresh_secret_key_2026_dev
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=rzp_test_secret_key_feedants
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_feedants
UPLOAD_PROVIDER=local
REGISTRATION_HOLD_TTL_MINUTES=15
REFERRAL_REWARD_AMOUNT=10
```

### Frontend (`app/.env`)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
EXPO_PUBLIC_WEB_BASE_URL=https://feedants.com
```
