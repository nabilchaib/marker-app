# HoopTrackr QA Checklist

This checklist is the minimum product and technical QA pass before treating HoopTrackr as production-ready for real users.

## 1. Environment and setup

- [ ] `npm ci` completes successfully.
- [ ] `npm start` runs the app locally with development environment variables.
- [ ] `npm run build` completes successfully.
- [ ] Firebase development environment points to `hoop-trackr-development`.
- [ ] Firebase production environment points to `hoop-trackr`.
- [ ] Required env vars are documented and available for dev/prod.
- [ ] Sentry is disabled safely when `REACT_APP_SENTRY_DSN` is absent.
- [ ] PostHog is disabled safely when `REACT_APP_POSTHOG_KEY` is absent.

## 2. Authentication

- [ ] Logged-out users are redirected to `/landing` when trying to access protected app routes.
- [ ] Logged-in users are redirected away from `/login`.
- [ ] New users are created or found through `addOrGetUserApi`.
- [ ] User is identified in PostHog after login when analytics is configured.
- [ ] User data is reset from Redux on logout.
- [ ] Refreshing the browser preserves expected authenticated app state.

## 3. New user onboarding

- [ ] A user with no teams sees a useful empty state.
- [ ] A user with no players sees a useful empty state.
- [ ] User can create a team from the empty state.
- [ ] User can create a player from the empty state.
- [ ] User understands what to do before starting a first game.

## 4. Team management

- [ ] User can create a team.
- [ ] Duplicate team name handling works for the same user.
- [ ] User can upload a team avatar.
- [ ] User can edit a team.
- [ ] User can delete a team.
- [ ] Deleting a team removes the related avatar object when present.
- [ ] Team list only shows teams belonging to the current user.
- [ ] Team form errors are visible and understandable.

## 5. Player management

- [ ] User can create a player.
- [ ] User can assign a player to a team.
- [ ] User can add player number.
- [ ] User can upload player avatar.
- [ ] User can edit a player.
- [ ] User can delete a player.
- [ ] Deleting a player removes the related avatar object when present.
- [ ] Player list only shows players belonging to the current user.
- [ ] Player form errors are visible and understandable.

## 6. Pickup game creation

- [ ] User can create a pickup game.
- [ ] User can select Team A and Team B.
- [ ] App prevents or handles selecting the same team twice.
- [ ] App handles teams with no players.
- [ ] Initial score is 0-0.
- [ ] Initial stats are empty or zeroed.
- [ ] Created game appears in game list.
- [ ] Created game opens correctly from game list.

## 7. Live pickup game tracking

For each action, verify both the UI and underlying Redux state.

### Scoring

- [ ] Made free throw adds 1 point.
- [ ] Made 2-pointer adds 2 points.
- [ ] Made 3-pointer adds 3 points.
- [ ] Missed free throw increments attempted free throws.
- [ ] Missed 2-pointer increments attempted twos.
- [ ] Missed 3-pointer increments attempted threes.
- [ ] Made shots also count as attempts if this is the intended product rule.
- [ ] Team score updates for the correct team.
- [ ] Player stats update for the correct player.

### Other stats

- [ ] Offensive rebound increments offensive rebounds.
- [ ] Defensive rebound increments defensive rebounds, if exposed in UI.
- [ ] Assist increments assists.
- [ ] Foul increments fouls.
- [ ] Last action table records each action.

### Selection state

- [ ] Selected team is visually obvious.
- [ ] Selected player is visually obvious.
- [ ] Changing team clears or updates selected player correctly.
- [ ] User cannot accidentally assign a stat to the wrong team/player without clear feedback.

## 8. Undo behavior

- [ ] Undo made free throw removes 1 point and decrements stat.
- [ ] Undo made 2-pointer removes 2 points and decrements stat.
- [ ] Undo made 3-pointer removes 3 points and decrements stat.
- [ ] Undo missed free throw decrements attempted free throws.
- [ ] Undo missed 2-pointer decrements attempted twos.
- [ ] Undo missed 3-pointer decrements attempted threes.
- [ ] Undo rebound decrements correct rebound type.
- [ ] Undo assist decrements assists.
- [ ] Undo foul decrements fouls.
- [ ] Undo drill completion decrements attempts and completions.
- [ ] Undo drill attempt decrements attempts.
- [ ] Undo with no actions does not crash.
- [ ] Undo cannot produce negative stats.

## 9. Game results and end game

- [ ] Game results modal opens.
- [ ] Game results show team scores.
- [ ] Game results show player stats.
- [ ] Back/close returns to game tracking.
- [ ] End game marks the game as finished.
- [ ] End game writes expected fields to Firestore.
- [ ] End game persists player stats when `REACT_APP_PERSIST_PLAYER_STATS=true`.
- [ ] Ending the same game twice does not create duplicate player stat records.
- [ ] Finished game no longer appears as an active unfinished game.

## 10. Drill creation and tracking

- [ ] User can create a drill.
- [ ] User can select one or more players, depending on current supported behavior.
- [ ] Drill opens correctly.
- [ ] Made increments attempts and completions.
- [ ] Miss increments attempts only.
- [ ] Success rate is calculated correctly.
- [ ] Drill result view shows attempts, completions, and success rate.
- [ ] Drill can be ended.
- [ ] Drill stats persist if persistence is enabled.

## 11. Tournament flow

- [ ] User can create a tournament.
- [ ] Required tournament fields validate correctly.
- [ ] Tournament appears in list.
- [ ] Tournament detail page opens.
- [ ] User can update tournament.
- [ ] User can delete tournament.
- [ ] Tournament list only shows tournaments belonging to the current user.

## 12. Persistence and refresh behavior

- [ ] Refresh during game tracking restores expected game state.
- [ ] Refresh after creating teams/players preserves expected state.
- [ ] Redux Persist does not leak state between users after logout/login.
- [ ] Firestore and Redux remain consistent after end game.
- [ ] Offline/poor network behavior is understandable to the user.

## 13. Firestore security

Use at least two test users.

- [ ] User A cannot read User B players.
- [ ] User A cannot list User B players.
- [ ] User A cannot update User B players.
- [ ] User A cannot delete User B players.
- [ ] User A cannot read User B teams.
- [ ] User A cannot list User B teams.
- [ ] User A cannot update User B teams.
- [ ] User A cannot delete User B teams.
- [ ] User A cannot read User B games.
- [ ] User A cannot list User B games.
- [ ] User A cannot update User B games.
- [ ] User A cannot delete User B games.
- [ ] User A cannot read User B player stats.
- [ ] User A cannot list User B player stats.
- [ ] User A cannot update User B player stats.
- [ ] User A cannot delete User B player stats.
- [ ] User A cannot read User B tournaments.
- [ ] User A cannot list User B tournaments.
- [ ] User A cannot update User B tournaments.
- [ ] User A cannot delete User B tournaments.

## 14. Analytics

- [ ] `signed_up` fires when a new user is created.
- [ ] `game_started` fires when a game starts.
- [ ] `game_finished` fires when a game finishes.
- [ ] `drill_started` fires when a drill starts.
- [ ] `drill_finished` fires when a drill finishes.
- [ ] `upgrade_prompt_shown` fires when monetization prompts are shown.
- [ ] Analytics does not block app behavior when PostHog is unavailable.

## 15. Sentry and error handling

- [ ] Sentry initializes only when DSN is present.
- [ ] ErrorBoundary fallback renders if a page crashes.
- [ ] User-facing errors are clear and non-technical.
- [ ] Critical Firebase failures are logged.
- [ ] Common failed operations show a toast or clear feedback.

## 16. Mobile scoring UX

- [ ] Main scoring buttons are easy to tap on a phone.
- [ ] Buttons are not too close together.
- [ ] Selected team/player state is visible without scrolling.
- [ ] Game controls do not require excessive vertical scrolling.
- [ ] UI works in portrait orientation.
- [ ] Scoring can keep up with a real pickup game.
- [ ] Undo is easy to find but not too easy to hit accidentally.

## 17. PWA behavior

- [ ] Manifest loads correctly.
- [ ] App has correct name: HoopTrackr.
- [ ] App icons load.
- [ ] Theme color appears correctly.
- [ ] App can be installed where supported.
- [ ] Installed app opens to expected route.

## 18. Release checklist

Before each release:

- [ ] Review merged PRs since last release.
- [ ] Run build.
- [ ] Run automated tests if available.
- [ ] Run manual smoke test.
- [ ] Confirm dev deploy works.
- [ ] Confirm production deploy is manual and intentional.
- [ ] Check Sentry after release.
- [ ] Check PostHog events after release.
- [ ] Document known issues.
