export const selectGame = state => {
  return state.game;
};

export const selectTeam = (state, team) => {
  return selectGame(state)[team] || {};
};

export const selectTeamPlayers = (state, team) => {
  return selectTeam(state, team).players || [];
};

export const selectTeamScore = (state, team) => {
  return selectTeam(state, team).score;
};
