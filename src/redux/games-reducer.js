import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: {
    teamA: null,
    teamB: null
  }
};

export let initialStats = {
  threes: 0,
  twos: 0,
  freeThrows: 0,
  attemptedThrees: 0,
  attemptedTwos: 0,
  attemptedFreeThrows: 0,
  offensiveRebounds: 0,
  defensiveRebounds: 0,
  assists: 0,
  fouls: 0,
};

export let initialDrillStats = {
  attempts: 0,
  completions: 0,
};

export const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    addNewGame: (state, action) => {
      const newGame = action.payload;
      state.byId[newGame.id] = newGame;
      state.allIds.push(newGame.id);
    },
    deleteGame: (state, action) => {
      const gameId = action.payload;
      state.byId[gameId] = null;
      state.allIds = state.allIds.filter(id => id !== gameId);
    },
    addMadeShot: (state, action) => {
      const { gameId, teamId, playerId, points } = action.payload;
      // stats
      state.byId[gameId].stats[teamId] = state.byId[gameId].stats[teamId] || {};
      state.byId[gameId].stats[teamId][playerId] = state.byId[gameId].stats[teamId][playerId] || { ...initialStats };
      if (points === 3) {
        state.byId[gameId].stats[teamId][playerId].threes += 1;
      } else if (points === 2) {
        state.byId[gameId].stats[teamId][playerId].twos += 1;
      } else {
        state.byId[gameId].stats[teamId][playerId].freeThrows += 1;
      }

      // score
      if (state.byId[gameId].teamAId === teamId) {
        state.byId[gameId].teamAScore += points;
      } else {
        state.byId[gameId].teamBScore += points;
      }
    },
    addAttemptedShot: (state, action) => {
      const { gameId, teamId, playerId, points } = action.payload;
      // stats
      state.byId[gameId].stats[teamId] = state.byId[gameId].stats[teamId] || {};
      state.byId[gameId].stats[teamId][playerId] = state.byId[gameId].stats[teamId][playerId] || { ...initialStats };
      if (points === 3) {
        state.byId[gameId].stats[teamId][playerId].attemptedThrees += 1;
      } else if (points === 2) {
        state.byId[gameId].stats[teamId][playerId].attemptedTwos += 1;
      } else {
        state.byId[gameId].stats[teamId][playerId].attemptedFreeThrows += 1;
      }
    },
    addRebound: (state, action) => {
      const { gameId, teamId, playerId, reboundType } = action.payload;
      // stats
      state.byId[gameId].stats[teamId] = state.byId[gameId].stats[teamId] || {};
      state.byId[gameId].stats[teamId][playerId] = state.byId[gameId].stats[teamId][playerId] || { ...initialStats };
      if (reboundType === 'offensive') {
        state.byId[gameId].stats[teamId][playerId].offensiveRebounds += 1;
      } else {
        state.byId[gameId].stats[teamId][playerId].defensiveRebounds += 1;
      }
    },
    addAssist: (state, action) => {
      const { gameId, teamId, playerId } = action.payload;
      // stats
      state.byId[gameId].stats[teamId] = state.byId[gameId].stats[teamId] || {};
      state.byId[gameId].stats[teamId][playerId] = state.byId[gameId].stats[teamId][playerId] || { ...initialStats };
      state.byId[gameId].stats[teamId][playerId].assists += 1;
    },
    addFoul: (state, action) => {
      const { gameId, teamId, playerId } = action.payload;
      // stats
      state.byId[gameId].stats[teamId] = state.byId[gameId].stats[teamId] || {};
      state.byId[gameId].stats[teamId][playerId] = state.byId[gameId].stats[teamId][playerId] || { ...initialStats };
      state.byId[gameId].stats[teamId][playerId].fouls += 1;
    },
    addDrillCompletion: (state, action) => {
      const { gameId, playerId } = action.payload;
      // stats
      state.byId[gameId].stats[playerId] = state.byId[gameId].stats[playerId] || { ...initialDrillStats };
      state.byId[gameId].stats[playerId].attempts += 1;
      state.byId[gameId].stats[playerId].completions += 1;
    },
    addDrillAttempt: (state, action) => {
      const { gameId, playerId } = action.payload;
      // stats
      state.byId[gameId].stats[playerId] = state.byId[gameId].stats[playerId] || { ...initialDrillStats };
      state.byId[gameId].stats[playerId].attempts += 1;
    },
    updateLastActions: (state, action) => {
      const { gameId, actions } = action.payload;
      state.byId[gameId].actions = actions;
    },
    undoLastAction: (state, action) => {
      const { gameId, actions } = action.payload;
      state.byId[gameId].actions = actions;
      const lastAction = actions[actions.length - 1];
      if (lastAction) {
        switch (lastAction.action) {
          case 'addMadeShot': {
            const { gameId, teamId, playerId, points } = lastAction;
            // stats
            if (points === 3) {
              state.byId[gameId].stats[teamId][playerId].threes -= 1;
            } else if (points === 2) {
              state.byId[gameId].stats[teamId][playerId].twos -= 1;
            } else {
              state.byId[gameId].stats[teamId][playerId].freeThrows -= 1;
            }

            // score
            if (state.byId[gameId].teamAId === teamId) {
              state.byId[gameId].teamAScore -= points;
            } else {
              state.byId[gameId].teamBScore -= points;
            }

            break;
          }
          case 'addAttemptedShot': {
            const { gameId, teamId, playerId, points } = lastAction;
            if (points === 3) {
              state.byId[gameId].stats[teamId][playerId].attemptedThrees -= 1;
            } else if (points === 2) {
              state.byId[gameId].stats[teamId][playerId].attemptedTwos -= 1;
            } else {
              state.byId[gameId].stats[teamId][playerId].attemptedFreeThrows -= 1;
            }

            break;
          }
          case 'addRebound': {
            const { gameId, teamId, playerId, reboundType } = lastAction;
            if (reboundType === 'offensive') {
              state.byId[gameId].stats[teamId][playerId].offensiveRebounds -= 1;
            } else {
              state.byId[gameId].stats[teamId][playerId].defensiveRebounds -= 1;
            }
            break;
          }
          case 'addAssist': {
            const { gameId, teamId, playerId } = lastAction;
            state.byId[gameId].stats[teamId][playerId].assists -= 1;
            break;
          }
          case 'addFoul': {
            const { gameId, teamId, playerId } = lastAction;
            state.byId[gameId].stats[teamId][playerId].fouls -= 1;
            break;
          }
          case 'addDrillCompletion': {
            const { gameId, playerId } = lastAction;
            state.byId[gameId].stats[playerId].completions -= 1;
            state.byId[gameId].stats[playerId].attempts -= 1;
            break;
          }
          case 'addDrillAttempt': {
            const { gameId, playerId } = lastAction;
            state.byId[gameId].stats[playerId].attempts -= 1;
            break;
          }
        }
      }
    },
    addGameToCache: (state, action) => {
      const { teamA, teamB } = action.payload;
      if (teamA) {
        state.editing.teamA = teamA;
      }

      if (teamB) {
        state.editing.teamB = teamB;
      }
    },
    removeGameFromCache: (state, action) => {
      const { type } = action.payload;
      if (type === 'teamA') {
        state.editing.teamA = null;
      } else {
        state.editing.teamB = null;
      }
    },
    resetGameCache: (state) => {
      state.editing = initialState.editing;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const {
  addNewGame,
  deleteGame,
  addMadeShot,
  addAttemptedShot,
  addRebound,
  addAssist,
  addFoul,
  addDrillAttempt,
  addDrillCompletion,
  updateLastActions,
  undoLastAction,
  addGameToCache,
  removeGameFromCache,
  resetGameCache,
} = gamesSlice.actions;

export default gamesSlice.reducer;
