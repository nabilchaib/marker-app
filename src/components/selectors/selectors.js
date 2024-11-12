export const selectGame = state => state.game;

export const selectAllPlayers = (state) => {
  return state.players.allIds.map((id) => state.players.byId[id]) || [];
};
export const selectTeamPlayers = (state, team, mode = 'game') => {
  if (mode === 'drill') {
    return selectAllPlayers(state);
  } else {
    return Object.values(selectTeam(state, team).players || {});
  }
};

export const selectTeam = (state, team) => {
  return selectGame(state)[team] || {};
};

export const selectTeamScore = (state, team) => {
  return selectTeam(state, team).score;
};
