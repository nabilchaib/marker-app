import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (_, action) => {
      const { game } = action.payload;
      return game;
    },
    addPlayer: (state, action) => {
      const { team, player } = action.payload;
      state[team].players[player.id] = player;
    },
    addAttemptedShot: (state, action) => {
      const { team, playerId, points } = action.payload;
      const player = state[team].players[playerId];
      player.stats.points.attempted[points]++;
    },
    addMadeShot: (state, action) => {
      const { team, playerId, points } = action.payload;
      const player = state[team].players[playerId];
      player.stats.points.made[points]++;
      state[team].score += parseInt(points);
    },
    addRebound: (state, action) => {
      const { team, playerId, type } = action.payload;
      const player = state[team].players[playerId];
      player.stats.rebounds[type]++;
    },
    addAssist: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players[playerId];
      player.stats.assists++;
    },
    addFoul: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players[playerId];
      player.stats.fouls++;
    },

    updateLastActions: (state, action) => {
      state.actions = action.payload;
    },

    undoLastAction: (state, action) => {
      state.actions = action.payload;
      const lastAction = state.actions[state.actions.length - 1];
      if (lastAction) {
        switch (lastAction.action) {
          case 'addMadeShot': {
            const { team, playerId, points } = lastAction;
            const player = state[team].players[playerId];
            player.stats.points.made[points]--;
            state[team].score -= parseInt(points);
            break;
          }
          case 'addAttemptedShot': {
            const { team, playerId, points } = lastAction;
            const player = state[team].players[playerId];
            player.stats.points.attempted[points]--;
            break;
          }
          case 'addRebound': {
            const { team, playerId, type } = lastAction;
            const player = state[team].players[playerId];
            player.stats.rebounds[type]--;
            break;
          }
          case 'addAssist': {
            const { team, playerId } = lastAction;
            const player = state[team].players[playerId];
            player.stats.assists--;
            break;
          }
          case 'addFoul': {
            const { team, playerId } = lastAction;
            const player = state[team].players[playerId];
            player.stats.fouls--;
            break;
          }
          default:
            break;
        }
      }
    }
  },
});

export const { addAttemptedShot, addMadeShot, addPlayer, addScore, addRebound, addAssist, addFoul, updateLastActions, undoLastAction, initializeGame } = gameSlice.actions;

export default gameSlice.reducer;
