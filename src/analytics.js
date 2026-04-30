import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = 'https://app.posthog.com';

export const initAnalytics = () => {
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST });
};

export const identifyUser = (email) => {
  if (!POSTHOG_KEY) return;
  posthog.identify(email);
};

export const resetUser = () => {
  if (!POSTHOG_KEY) return;
  posthog.reset();
};

export const track = (event, properties = {}) => {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
};

// Named event helpers
export const trackSignedUp = () => track('signed_up');
export const trackGameStarted = (type) => track('game_started', { type });
export const trackGameFinished = (type) => track('game_finished', { type });
export const trackDrillStarted = () => track('drill_started');
export const trackDrillFinished = () => track('drill_finished');
export const trackUpgradePromptShown = (feature) => track('upgrade_prompt_shown', { feature });
