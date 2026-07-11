# VoltIQ — Phase 0: Foundation

Frontend-only scaffold for VoltIQ (Next.js App Router + TypeScript + Tailwind + shadcn-style primitives).
No backend, auth, or AI calls are implemented yet — mock data only.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see a "design system check" placeholder page
confirming colors, typography, and components render correctly, including dark mode
(toggle your OS theme or wire up a theme switcher in Phase 2).

## What's included in this phase

- `tailwind.config.ts` / `app/globals.css` — full design token system (emerald primary,
  blue secondary, light + dark HSL variables, custom shadows/radii)
- `app/layout.tsx` — fonts (Manrope display / Inter body / JetBrains Mono data) + theme provider
- `components/ui/` — Button, Card, Badge, Dialog, Skeleton primitives
- `components/states.tsx` — EmptyState, ErrorState, CardSkeleton, ChartSkeleton, TableSkeleton
- `components/chart-card.tsx` — shared chart wrapper + color palette (all charts route through this)
- `types/index.ts` — TypeScript types matching the planned schema (User, Bill, Forecast, etc.)
- `lib/mock-data.ts` — seeded, deterministic mock data fixtures for every entity

## Roadmap (subsequent phases build inside this foundation)

1. ~~Foundation & design system~~ ✅
2. ~~Marketing shell (landing page + auth screens)~~ ✅
3. ~~Dashboard~~ ✅ (Part 1 + Part 2 both done)
4. ~~Upload Bill flow~~ ✅ this delivery
5. ~~Analytics page~~ ✅ this delivery
6. ~~AI Assistant~~ ✅ this delivery
7. ~~Reports & Notifications~~ ✅ this delivery
8. ~~Polish pass~~ ✅ this delivery

All 8 phases complete. See "Phase 8 QA notes" below for what was checked and fixed.

## Phase 8 QA notes

- **Fixed:** `h-4.5`/`w-4.5` icon sizing classes in 3 components weren't valid Tailwind
  utilities (the default scale has no `4.5` step) and were silently rendering at
  browser-default icon size. Replaced with `h-5 w-5` in `report-row.tsx`,
  `summary-cards.tsx`, and `savings-opportunities-list.tsx`.
- **Checked:** no hardcoded colors that would break dark mode (searched for
  `bg-white`, `bg-gray-*`, `text-black`, `text-gray-*` outside of the two
  intentional cases — a semi-transparent black modal/drawer overlay and a
  switch thumb — both of which are correct in either theme).
- **Added:** the topbar search bar was previously a non-functional placeholder.
  It now searches across bills, reports, recommendations, and notifications
  (`lib/search.ts`) and shows a live dropdown of results you can click straight
  into — try typing "solar," "June," or "HVAC" from any page.
- **Added (post-Phase-8):** `/about` and `/contact` pages, replacing dead `#`
  links in the footer. About covers the company story, mission, and values
  (including the "why this beats pasting a bill into a chatbot" framing).
  Contact has a mock-submit form plus direct email/support info.
4. Dashboard
5. Upload Bill flow
6. Analytics page
7. AI Assistant chat UI
8. Reports & Notifications
9. Polish pass (responsive/dark-mode/a11y QA)

Ask for the next phase by number/name and it'll be generated inside this same structure.

## Setting up Supabase (Step 1 of the backend)

This connects your app to a real database. Follow these in order — none of
them require coding, just clicking through Supabase's website.

### A. Create your Supabase project
1. Go to **supabase.com** and click **Start your project** (sign up free if
   you don't have an account — GitHub login is easiest)
2. Click **New Project**
3. Give it a name, like `voltiq`
4. Create a **database password** — click the button to auto-generate one,
   then **copy it somewhere safe** (a Notes app is fine) — you likely won't
   need it again soon, but don't lose it
5. Pick a region close to you
6. Click **Create new project** and wait a minute or two while it sets up

### B. Create your tables
1. In the left sidebar of your new project, click the **SQL Editor** icon
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project (any text editor,
   like TextEdit, works — or open it right in VS Code if you have it)
4. **Select all the text** in that file (Cmd+A), **copy** it (Cmd+C)
5. **Paste** it into the Supabase SQL Editor box
6. Click **Run** (bottom right, or Cmd+Enter)
7. You should see a green "Success" message. If you see red text instead,
   copy the error message and send it to me

### C. Confirm your tables exist
1. In the left sidebar, click **Table Editor**
2. You should see 6 tables listed: `profiles`, `bills`, `forecasts`,
   `recommendations`, `chats`, `notifications`
3. Click into any of them — they'll be empty right now, which is expected

### D. Get your connection keys
1. In the left sidebar, click the **Settings** gear icon, then **API**
2. You'll see a **Project URL** — copy it
3. Just below, you'll see a **Project API keys** section with an **anon
   public** key — copy that too

### E. Connect your local project to Supabase
1. In your `VoltIQ-Phase-Zero` folder, find the file `.env.local.example`
2. Make a **copy** of it (right-click → Duplicate on Mac)
3. **Rename the copy** to exactly `.env.local` (yes, starting with a dot,
   no "example" at the end)
4. Open `.env.local` in a text editor
5. Replace `your-project-url-here` with the Project URL you copied
6. Replace `your-anon-public-key-here` with the anon public key you copied
7. Save the file

### F. Install the new packages and restart
```
npm install
npm run dev
```

Nothing will *look* different in the app yet — this step just builds the
foundation. Step 2 (real login/register) is what actually starts using it.

### If something goes wrong
Paste me the exact error message (from the SQL Editor, the terminal, or the
browser) and we'll troubleshoot from there — don't worry about interpreting
it yourself first.

## Setting up real authentication (Step 2 of the backend)

The Login, Register, Forgot Password, and Reset Password forms are now
wired to real Supabase Auth — no more fake "submit and nothing happens."
Logout (in the sidebar, mobile menu, and top-right avatar menu) now really
signs you out. Visiting a page like `/dashboard` while logged out will
redirect you to `/login`; visiting `/login` while already logged in
redirects you to `/dashboard`.

**One setting to change first, for easier testing:** by default, Supabase
requires new users to click a confirmation link in their email before they
can log in. To skip that while you're testing locally:

1. In your Supabase project, go to **Authentication** (left sidebar)
2. Click **Providers** (or **Sign In / Providers**, depending on the layout)
3. Click into **Email**
4. Turn **off** the toggle labeled **Confirm email**
5. Save

With that off, creating an account logs you straight in — no email needed.
(Turn this back on before any real person outside your team signs up.)

**One more setting for the password-reset flow to work:** Supabase only
allows redirecting back to URLs you've explicitly approved.

1. Go to **Authentication → URL Configuration**
2. Under **Redirect URLs**, add: `http://localhost:3000/reset-password`
3. Save

### Trying it out
- Go to `/register`, create an account — you should land straight on
  `/dashboard` (with email confirmation off)
- Click your avatar (top right) → **Logout** — you should be sent to
  `/login`
- Try visiting `localhost:3000/dashboard` directly while logged out — it
  should bounce you to `/login` instead of showing the page
- Try `/forgot-password` with your real email — you should get an actual
  email from Supabase with a reset link

### What's still mock data
The dashboard, profile, and every other page still display the same mock
data as before (Jordan Reyes, the sample bills, etc.) — logging in doesn't
yet pull your *real* profile or bills, since no real data has been created
for your account yet. That swap (replacing `mockUser` and friends with
real Supabase queries) is a good next step once this phase is confirmed
working.

## Setting up real bill upload + parsing (Step 3 of the backend)

Uploading a bill now does three real things: stores your original PDF in
Supabase Storage, sends it to Claude (Anthropic's AI) to read and extract
the numbers, and saves those numbers as a real row in your `bills` table.
Three setup steps first — a mix of dashboard clicks and one new API key.

### A. Create a Storage bucket for the PDFs
1. In Supabase, click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly `bills` (lowercase)
4. Leave it **Private** (do not make it public) — this matters, since
   bills contain personal information
5. Click **Create bucket**

### B. Lock the bucket down to each user's own files
1. Go to **SQL Editor** → **New query**
2. Open `supabase/storage-policies.sql` from this delivery, copy all of it
3. Paste into the SQL Editor, click **Run**
4. You should see the same green "Success" as before

### C. Get an Anthropic API key
1. Go to **console.anthropic.com** and sign up or log in
2. Find **API Keys** in the left sidebar (may be under a "Settings" menu)
3. Click **Create Key**, give it any name (e.g. `voltiq-dev`)
4. Copy the key immediately — most consoles only show it once
5. Note: this is a **paid, usage-based API** — extracting one bill costs a
   very small fraction of a cent with the model this uses, but you'll want
   to add a few dollars of credit to your Anthropic account before testing

### D. Add the key to your project
1. Open your existing `.env.local` file (the one you already made in Step 1)
2. Add a new line at the bottom:
   ```
   ANTHROPIC_API_KEY=paste-your-key-here
   ```
3. Save the file

### E. Install and restart
```
npm install
npm run dev
```

### Try it
1. Go to `/upload`
2. Drop in a real PDF utility bill (yours, or any sample bill PDF)
3. Click **Analyze Bill** — the progress bar is now tied to a real request,
   not a fake timer
4. You should see a real success modal, and the bill should actually appear
   in the **Upload History** table below with real extracted numbers

### If extraction quality is poor
The upload route uses a fast, inexpensive Claude model
(`claude-haiku-4-5-20251001`) by default, which should read most standard
bills fine. If it's consistently getting numbers wrong on your specific
bill format, open `app/api/upload-bill/route.ts` and change that model
string to `claude-sonnet-5` — more capable, costs a bit more per upload.

### What's still not connected yet
The Dashboard, Analytics, and AI Assistant still show the original mock
data (Jordan Reyes, the sample 6 months of bills) — they don't yet pull
from your real uploaded bills. That's a natural next step once you've
confirmed real uploads are working correctly.

## Setting up real forecasting + Energy Health Score (Step 4 of the backend)

This step replaces the hardcoded forecast and health score with real math
computed from your actual bill history. One SQL function to add; no new
API keys needed.

### A. Add the peer comparison function
1. **SQL Editor** → **New query**
2. Open `supabase/peer-comparison-function.sql` from this delivery, copy
   all of it, paste it in, click **Run**
3. Green "Success" again — same pattern as before

### B. Install and restart
```
npm install
npm run dev
```
(No new packages were actually added this step, but restarting is always
a safe habit after pulling in new files.)

### What's now real
- **Forecast**: fits a trend line through your real bill history and
  projects next month's cost/kWh — with a confidence score derived from
  how much history exists and how volatile your usage has been (not a
  fixed number)
- **Energy Health Score**: computed from real trend, consistency, and
  peak-usage-share factors in your bills — every factor shown is one that
  actually moved the score, not decoration
- **Peer comparison** ("using less energy than X% of similar homes"): this
  one is worth understanding, because it's the most technically involved
  piece. It's computed by a database function that can see across *all*
  users to calculate an aggregate percentile, but is specifically written
  to only ever return that one number — never any other user's name, bill
  amount, or profile. It also only shows up once there are at least 5
  comparably-sized homes with bill data — before that, you'll see an
  honest "not enough homes yet" message instead of a made-up number

### Why the Dashboard might look "emptier" than before
With just your own test account, you likely won't have 5+ similar homes
to compare against yet, and a fresh account only has as much bill history
as you've actually uploaded. This is expected — the app is now telling
you the truth about how much data exists, rather than showing a polished
fake number that implied more than was real. As you (or later, real
users) upload more bills, the forecast, health score, and peer comparison
all get more substantial.

### What's still not connected
Recommendations and Notifications are still the original mock data (not
part of this step). Analytics still shows sample data too — only the
Dashboard's forecast, health score, and related charts are wired to your
real bills for now.



## Setting up the real AI Assistant (Step 5 of the backend)

The AI Assistant chat now calls a real Claude model instead of matching
your message against a handful of pre-written responses. No new signup
needed — it reuses the same `ANTHROPIC_API_KEY` from Step 3.

### Nothing new to set up
If Step 3 (bill upload) is already working, this step just works after
you merge the files in and restart:
```
npm install
npm run dev
```

### What's now real
- Every response is generated by Claude (`claude-sonnet-5`), not matched
  against keywords
- The model is given your **real** profile (home size, solar/battery/EV),
  your **real** recent bills, and your **real** computed forecast and
  Energy Health Score as context for every message — ask it "why was my
  bill higher" and it's reasoning over your actual numbers, not a script
- Conversations are now saved to the database and reload when you come
  back to the page — actual continuity across sessions, not a chat that
  resets every time you leave

### An honest guardrail built into the prompt
The assistant is explicitly instructed not to invent an appliance-level
breakdown (e.g., "your fridge used X kWh") if asked, since that data
doesn't actually exist yet — it's told to say so honestly instead of
making up a plausible-sounding number. Try asking it something like "how
much did my fridge use this month" to see this in action.

### A cost note
This uses `claude-sonnet-5` rather than the cheaper Haiku model used for
bill parsing, since conversation quality matters more here and the volume
per user is naturally lower than bulk document processing. At current
introductory pricing ($2/$10 per million tokens through August 31, 2026,
rising to $3/$15 after), a typical back-and-forth conversation costs a
handful of cents, not fractions of a cent like a single bill upload — still
inexpensive, just worth knowing it's a different cost profile. If you want
to cut cost further, you can change the model string in
`app/api/chat/route.ts` from `claude-sonnet-5` to
`claude-haiku-4-5-20251001` — cheaper, somewhat less nuanced conversation.

### What's still not connected
Reports and Notifications are still mock. Analytics and Recommendations
are unchanged from Step 4. Only the Dashboard's core stats and the AI
Assistant are wired to real data + real AI so far.

## Setting up real notifications (Step 6 of the backend)

Notifications now come in two flavors, matching two different real
triggers — worth understanding the difference, since they set up
differently.

### 1. Reactive notifications (works immediately, no setup)
Every time you upload a bill, the app re-checks your full history against
a few defined rules (usage spike, forecasted increase, high peak-hour
share, declining health score) and creates a real notification if one is
warranted. This already works as soon as you merge these files in — no
new setup needed beyond the usual:
```
npm install
npm run dev
```
Upload a bill and check `/notifications` or the Dashboard afterward.

### 2. Scheduled background check (needs setup, only auto-runs once deployed)
This is the more literal "background job" — it checks every user (not
just whoever's currently active) for stale accounts, e.g. "you haven't
uploaded a bill in 35+ days," and creates a reminder. This needs two new
things:

**A. Get your Supabase service role key**
1. In Supabase: **Settings → API Keys**
2. Find the key labeled **`service_role`** (not `anon`) and copy it
3. ⚠️ This key bypasses all your security rules — treat it like a master
   password. Never put it in a `NEXT_PUBLIC_` variable, never share it

**B. Add two new lines to your `.env.local`**
```
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
CRON_SECRET=make-up-any-long-random-string-here
```
(`CRON_SECRET` isn't from Supabase — just make up a long random password
yourself. It stops random people from triggering this job by guessing
its URL.)

### Testing the scheduled check locally (before it's deployed)
Since there's no real "schedule" running on your laptop, you can trigger
it manually to see it work, using this in your terminal (replace the
secret with whatever you set):
```
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/check-stale-bills
```
You should get back something like `{"usersChecked":1,"notificationsCreated":0}`
(0 is expected unless your account is actually 35+ days old with no bills).

### Once this is deployed to Vercel (Step 8)
The `vercel.json` file included here tells Vercel to run this check
automatically, once a day, with no manual triggering needed — Vercel
handles sending the correct secret for you. Nothing extra to configure
beyond making sure `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are added
to your Vercel project's environment variables (same names, same values
as your local `.env.local`).

### What's still not connected
Reports, Recommendations, and Analytics are still mock data. Everything
else (Dashboard's core stats, AI Assistant, and now Notifications) is
running on real data.



## Deploying for real (Step 8 of the backend)

Everything up to now has run on your laptop. This step puts VoltIQ on the
real internet, at a real URL anyone can visit.

### What's new in this delivery, and why
Before the deployment steps themselves, a few things got added to make
this a genuinely production-ready app, not just a working one:

- **Clear environment variable errors.** Tonight's `.env.local` debugging
  (the missing file, the `#` character) took a while to track down partly
  because the errors were vague. Every place the app reads a secret now
  goes through `lib/env.ts`, which throws an immediate, specific error —
  e.g. *"Missing required environment variable: CRON_SECRET. Add it to
  your .env.local file..."* — instead of a cryptic SDK error three layers
  down. This will save real time on Vercel too, where a misconfigured
  variable is otherwise annoying to diagnose from deployment logs alone.
- **Security headers** (`next.config.mjs`): things like blocking the site
  from being embedded in someone else's iframe, and forcing HTTPS-only
  connections. Small, standard, and genuinely worth having on an app that
  handles real personal utility bills.
- **A health check endpoint** (`/api/health`): once deployed, hitting this
  URL tells you immediately whether the app *and* its database connection
  are actually working — not just "the server responded." Free uptime
  monitors (UptimeRobot, Better Uptime, etc.) can ping this on a schedule
  and text/email you if it ever goes down.
- **A real error page** (`app/global-error.tsx`): if something crashes in
  production, users now see a branded "something went wrong, try again"
  screen instead of a blank white page.
- **`robots.txt` and `sitemap.xml`**: basic SEO hygiene so search engines
  index your public marketing pages but never your private dashboard
  pages.
- **Open Graph tags**: when someone shares your VoltIQ link on social
  media, Slack, or iMessage, it'll now show a proper title/description
  preview instead of nothing.

### A. Push your latest code to GitHub
Same as every phase — GitHub Desktop, commit, push. Make sure this
delivery's files are included.

### B. Import the project into Vercel
1. Go to **vercel.com**, sign in with GitHub
2. Click **Add New...** → **Project**
3. Find and select your `VoltIQ-Phase-Zero` repo, click **Import**
4. Vercel auto-detects Next.js — leave the build settings as default

### C. Add your environment variables
Before clicking Deploy, add every variable from your local `.env.local`:
1. In the import screen (or later under **Settings → Environment
   Variables**), add each of these, copying the exact values from your
   local file:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ANTHROPIC_API_KEY
   SUPABASE_SERVICE_ROLE_KEY
   CRON_SECRET
   ```
2. Click **Deploy**

### D. Update Supabase for your new production URL
Your app now exists at two places (localhost, and your new Vercel URL),
and Supabase needs to know about both:
1. Once deployed, copy your new Vercel URL (something like
   `https://voltiq-phase-zero.vercel.app`)
2. In Supabase: **Authentication → URL Configuration**
3. Add `https://your-vercel-url.vercel.app/reset-password` to **Redirect
   URLs** (keep the existing `localhost:3000` one too — you still need it
   for local testing)
4. Also update **Site URL** to your production URL

### E. Verify it actually works
1. Visit your new Vercel URL
2. Visit `your-url.vercel.app/api/health` — you should see
   `{"status":"ok","database":"connected",...}`
3. Register a new account, log in, upload a bill, try the AI Assistant —
   the full real flow, on the real internet this time

### F. The scheduled notification check now runs itself
Since `vercel.json` is already in this project, Vercel automatically
starts running `check-stale-bills` once a day — no manual curl command
needed anymore. Vercel sends the correct `CRON_SECRET` for you.



## Replacing mock data with real data: Profile, Analytics, Reports

This delivery removes the last big chunk of mock data from the app. One
new SQL step, then everything else just works after merging.

### A. Add the welcome-notification trigger update
1. **SQL Editor** → **New query**
2. Open `supabase/welcome-notification-trigger.sql`, copy all of it, paste
   it in, click **Run**
3. Green "Success," same as every other SQL step so far

### B. Install and restart
```
npm install
npm run dev
```

### What changed, and why

**Profile page** — now fetches and saves your real data. Name and email
are automatically filled in the moment you sign up (this was actually
already working since Step 1 — the database trigger that creates your
profile row already copied your name and email over; the Profile *page*
just wasn't reading it, it was hardcoded to show "Jordan Reyes" regardless).
Every field now loads your real saved values and the Save button writes
real changes back to the database.

**New: a welcome notification on signup.** The same trigger that creates
your profile now also creates a notification nudging you to fill in home
size, occupants, and equipment — check `/notifications` after registering
a fresh test account to see it.

**Topbar fixed too.** While working on this, I found the account menu (top
right) and the notification bell's unread count were *still* quietly using
mock data, even after Step 6 made the Notifications page itself real —
these would've shown "Jordan Reyes" and a stale count forever. Both now
reflect your real name and real unread count.

**Analytics page** — now fetches your real bills and computes real
comparisons, trends, and charts, the same way the Dashboard has since
Step 4. If you have zero bills, you'll see a clean "nothing to analyze
yet" prompt instead of a page full of fake numbers.

**Two things on Analytics that are honestly still sample data, and now
clearly labeled as such:** the Appliance Breakdown chart and the Savings
Opportunities list. Both got a visible "Sample" badge. Reasoning: we have
no real per-appliance data source, and no real recommendation-generation
logic built yet — leaving these unlabeled next to now-real charts would
have been more misleading than before, not less, since it'd look like
everything on the page was equally real.

**Reports page** — every real, successfully processed bill now
automatically becomes a real "Monthly Audit" report entry, with its real
date. Annual Summary / Forecast / Efficiency report types don't have real
generation logic yet, so they simply won't appear until that's built —
no fake placeholder entries standing in for them anymore.

**One honest limitation on Reports:** the Download button is now
intentionally disabled with a tooltip explaining PDF export isn't built
yet. It previously faked a working download — now that the report
*entries* are real, faking the download next to them would be a bigger,
more confusing gap. Real PDF generation is a genuinely separate, sizable
piece of work worth its own future step.



## Note on scope

The app is deployed and production-hardened. Real: authentication, bill
upload/parsing, forecasting, Energy Health Score, peer comparison, the AI
Assistant, Notifications, Profile, Analytics, and Reports (as real
Monthly Audits derived from real bills). Still honestly mock, and clearly
labeled as such in the UI: the Appliance Breakdown chart and the Savings
Opportunities list — both need capabilities (appliance disaggregation,
real recommendation logic) that haven't been built yet. Real PDF
generation for report downloads also isn't built.

All 9 steps of the original backend plan are now complete, including
Step 9: real Privacy Policy and Terms of Service pages (`/privacy`,
`/terms`), linked from the footer and the registration checkbox. These
are solid starting drafts specific to what VoltIQ actually does — not
generic boilerplate — but are not a substitute for review by a real
lawyer before this is fully public, especially once payments or a wider
user base are involved.
