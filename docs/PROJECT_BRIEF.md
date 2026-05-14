# HoopTrackr Project Brief

## Identity

HoopTrackr is a basketball tracking app in the GitHub repository `nabilchaib/marker-app`. The repository package name is still `marker-app`, but the product brand is HoopTrackr / Hoop Trackr.

The product helps basketball players, coaches, organizers, and pickup groups track games, drills, teams, players, tournaments, and player statistics in real time.

Current positioning:

> Track Your Game, Elevate Your Play

Current landing-page promise:

> The ultimate basketball companion for tracking games, drills, and player stats in real-time.

## Product vision

HoopTrackr should become the easiest way to capture useful basketball performance data during real games and training sessions without slowing down the game.

The product should be fast enough for a live scorer, simple enough for pickup runs, and structured enough for coaches, youth teams, 3x3 leagues, and tournament organizers.

## Current stack

- React 18 / Create React App
- React Router DOM
- Redux Toolkit
- Redux Persist
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting
- Tailwind CSS
- MUI
- Headless UI
- Heroicons
- Emotion
- Framer Motion
- PostHog analytics
- Sentry error tracking
- GitHub Actions CI/deploy

## Firebase environments

- Development Firebase Hosting project: `hoop-trackr-development`
- Production Firebase Hosting project: `hoop-trackr`

## Core product areas

### Marketing and onboarding

- Landing page
- Demo page
- Login/signup through Firebase Auth
- Protected app routes for authenticated users

### Team and player management

- Create, edit, list, and delete teams
- Create, edit, list, and delete players
- Player and team avatar upload through Firebase Storage

### Pickup game tracking

- Create pickup games
- Select teams
- Select players
- Track made shots: free throws, 2-pointers, 3-pointers
- Track missed shots / attempts
- Track rebounds
- Track assists
- Track fouls
- Undo last action
- View last actions
- View game results
- End game

### Drill tracking

- Create drills
- Select players
- Track made attempts / completions
- Track misses / attempts
- Calculate success rate
- View drill results

### Tournaments

- Create tournaments
- List tournaments
- View tournament detail
- Update and delete tournaments

### Analytics and observability

- PostHog user identification and event capture
- Sentry initialization and ErrorBoundary
- Existing analytics helpers:
  - `signed_up`
  - `game_started`
  - `game_finished`
  - `drill_started`
  - `drill_finished`
  - `upgrade_prompt_shown`

## Data model overview

Main Firestore collections currently used or referenced:

- `users`
- `players`
- `teams`
- `game`
- `player_stats`
- `tournaments`

Game stats include:

- threes
- twos
- free throws
- attempted threes
- attempted twos
- attempted free throws
- offensive rebounds
- defensive rebounds
- assists
- fouls

Drill stats include:

- attempts
- completions

## Brand notes

- Product name: HoopTrackr
- Preferred brand font from prior product decisions: Audiowide
- Key colors:
  - Orange: `#f64e07`
  - Dark blue: `#0a355e`
  - Cyan: `#0aa6d6`
- PWA style: mobile-first, portrait orientation, standalone display

## Current maturity assessment

HoopTrackr is past prototype and has the foundations of an MVP:

- Authentication exists
- Team and player management exists
- Pickup game tracking exists
- Drill tracking exists
- Tournament functionality exists
- Firebase persistence exists
- Player stat persistence has been recently hardened
- Analytics exists
- Error monitoring exists
- Dev and production deploy workflows exist

However, HoopTrackr is not yet a fully hardened production SaaS. The next phase should focus on reliability, security, regression tests, mobile scoring UX, onboarding clarity, and a clear first commercial wedge.

## Current strategic priority

The next version of the HoopTrackr operating system should replace the old HoopTrackr CEO Custom GPT. The new assistant should act as a CEO / product / technical operating layer for the project.

It should help with:

- Product strategy
- Roadmap management
- GitHub PR review
- Coding-agent tickets
- Technical architecture decisions
- QA and release readiness
- Monetization experiments
- Growth and marketing copy
- User segment selection
- Investor/founder-style reporting

## Most important risks to watch

1. Firestore rules currently allow broad authenticated reads/lists on several collections. This should be tightened so users cannot list other users' private data.
2. Stats persistence was recently fixed and should receive regression coverage.
3. The codebase has evolved from an early scoreboard into a broader product; older game structures and newer Redux structures should be reconciled.
4. The scoring UI must remain extremely fast on mobile. Basketball tracking fails if the scorer needs too many taps.
5. CRA is workable but aging. A future migration to Vite, Next.js, or a stronger PWA setup may eventually be valuable.
6. Monetization is not yet fully defined, even though analytics contains an upgrade prompt event.

## Next operating question

The main product strategy decision is the first wedge:

- Pickup players
- Youth coaches
- Small teams
- 3x3 leagues
- Tournament organizers
- Individual training / drills

The recommended near-term wedge is to validate pickup games plus small organized groups first, while keeping coaches and tournament organizers as the next expansion path.
