# HoopTrackr Roadmap

## Roadmap principles

HoopTrackr should optimize for speed, clarity, and trust.

A basketball scorer should be able to record an action in one or two taps while the game keeps moving. A player or coach should be able to trust that the stats are accurate, persisted, and easy to review later.

This roadmap is organized around product maturity rather than calendar dates.

## Phase 0 — Stabilize the operating foundation

Goal: make the current app understandable, maintainable, and ready for product decisions.

### Outcomes

- Clear project documentation exists in the repository.
- Product, tech, QA, and CEO GPT context are documented.
- Current risks are visible.
- Future coding agents can work from shared context.

### Work

- Add `docs/PROJECT_BRIEF.md`.
- Add `docs/ROADMAP.md`.
- Add `docs/QA_CHECKLIST.md`.
- Add `docs/CEO_GPT_CONTEXT.md`.
- Keep README focused on local setup and deployment.
- Create follow-up issues for security hardening, regression tests, and wedge selection.

### Done when

- Documentation PR is merged.
- Follow-up issues exist.
- The CEO GPT can use the repo docs as canonical context.

## Phase 1 — Harden the MVP

Goal: make the existing app reliable enough for repeated real-world scoring sessions.

### Product scope

- Pickup game tracking
- Drill tracking
- Teams
- Players
- Game results
- Basic tournament support

### Technical work

- Tighten Firestore rules so users cannot list or read other users' private records.
- Confirm all queries are scoped by `createdBy` or equivalent ownership fields.
- Add regression coverage for:
  - made shot
  - missed shot / attempt
  - rebound
  - assist
  - foul
  - undo
  - drill attempt
  - drill completion
  - end game
  - player stats persistence
- Add test fixtures for game, team, player, drill, and tournament state.
- Audit old game shape vs current Redux game shape.
- Remove stale or unused code paths where safe.
- Confirm production build and manual production deploy still work.

### Product QA work

- Test with one real pickup game.
- Test with one real drill session.
- Record all scoring friction points.
- Measure how many taps are needed for common actions.

### Done when

- A user can create teams/players, track a full pickup game, end it, and later see persisted stats.
- A user can track a drill session and see results.
- Cross-user data access is blocked at the rules level.
- The core scoring flow survives refresh/reload without data loss.

## Phase 2 — Improve live scoring UX

Goal: make the scorer experience fast enough for real basketball.

### Product work

- Optimize mobile layout for one-handed use.
- Make selected team and selected player always obvious.
- Reduce taps for common actions.
- Improve undo confidence.
- Add clearer game clock or session context if needed.
- Improve empty states for new users with no teams or players.
- Improve game result readability.

### UX questions

- Should scorer select player first, then stat?
- Should scorer select stat first, then player?
- Should there be a quick player grid for each team?
- Should missed shots be tracked as separate attempt buttons or as a made/miss pair?
- Should rebounds distinguish offensive/defensive in the first MVP?

### Done when

- A scorer can track live pickup action without falling behind.
- The main scoring actions are reachable with minimal cognitive load.
- The app feels mobile-native even though it is web/PWA-based.

## Phase 3 — Pick the first commercial wedge

Goal: decide who HoopTrackr should serve first.

### Candidate wedges

1. Pickup players and recurring pickup groups
2. Youth coaches and small teams
3. 3x3 leagues
4. Tournament organizers
5. Individual training / drill tracking

### Recommended first wedge

Start with pickup players plus small organized groups.

Why:

- This matches the original product energy.
- It requires less institutional sales than schools or leagues.
- It creates real game data quickly.
- It can expand naturally into team and tournament use.
- The user already has basketball/referee/community context.

### Validation questions

- Who is willing to score the game?
- What stats do players actually care about after the game?
- Would a pickup group share the app after one good session?
- Is the value individual pride, team organization, player development, or league credibility?
- What feature would make users return next week?

### Done when

- One target persona is selected.
- The landing page speaks directly to that persona.
- The first pricing hypothesis is documented.
- The first user test script is ready.

## Phase 4 — Monetization experiment

Goal: test whether users will pay or upgrade.

### Possible free tier

- Create teams and players
- Track limited games per month
- Track limited drills per month
- Basic game results

### Possible paid features

- Unlimited games
- Unlimited drill history
- Player stat history
- Team dashboards
- Tournament mode
- Export/share game reports
- Advanced shooting charts
- Multiple scorers/admins
- Branded league pages

### Analytics needed

- signup completed
- first team created
- first player created
- first game started
- first game finished
- first drill started
- first drill finished
- game results viewed
- upgrade prompt shown
- upgrade CTA clicked

### Done when

- A simple pricing hypothesis exists.
- Upgrade prompts are tied to real usage limits.
- Analytics can show activation and retention.

## Phase 5 — Coach/team layer

Goal: expand from pickup tracking to structured development.

### Features

- Player profiles with stat history
- Team dashboard
- Drill history by player
- Shooting splits
- Player comparison
- Coach notes
- Exportable player report

### Done when

- Coaches can use HoopTrackr to review player progress.
- Players have a reason to keep their profile over time.

## Phase 6 — Tournament and league layer

Goal: support organized 3x3 or small basketball events.

### Features

- Tournament brackets or pools
- Game schedule
- Team registration
- Standings
- Public results page
- Shareable tournament link
- Organizer dashboard

### Done when

- A small tournament can be run end to end using HoopTrackr.

## Phase 7 — Platform modernization

Goal: reduce technical drag and prepare for scale.

### Possible work

- Evaluate CRA to Vite migration.
- Evaluate PWA install improvements.
- Evaluate Next.js only if server-rendered marketing, SEO, or backend routes become important.
- Improve test suite.
- Improve CI quality gates.
- Add stronger type coverage over time.

### Done when

- The frontend stack feels fast and maintainable.
- New features can be shipped safely.
