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
      const { team, playerId, points, type_of_game } = action.payload;
    
      // If drill mode, access player directly without team structure
      if (type_of_game === "drill") {
        const player = state.players?.[playerId];
        if (player) {
          player.stats.drill_attempts = (player.stats.drill_attempts || 0) + 1;
        }
      } else {
        // Game mode: access player through team structure
        const player = state[team]?.players?.[playerId];
        if (player) {
          player.stats.points.attempted[points]++;
        }
      }
    },
    
    addMadeShot: (state, action) => {
      const { team, playerId, points, type_of_game } = action.payload;
    
      let player;
    
      if (type_of_game === "drill") {
        // Access player stats directly for drill mode
        player = state.players[playerId];
        if (!player) {
          console.error(`Player with ID ${playerId} not found in drill mode.`);
          return;
        }
        player.stats.drill_attempts = (player.stats.drill_attempts || 0) + 1;
        player.stats.drill_made = (player.stats.drill_made || 0) + 1;
      } else if (team) {
        // Access player within the team for game mode
        player = state[team]?.players?.[playerId];
        if (!player) {
          console.error(`Player with ID ${playerId} not found in team ${team} for game mode.`);
          return;
        }
        player.stats.points.made[points]++;
        state[team].score += parseInt(points);
        console.log('Game mode stats updated:', player.stats);
      } else {
        console.error("Unexpected state: team is null in game mode.");
      }
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
            const { team, playerId, points, type_of_game } = lastAction;
            const player = state[team].players[playerId];
            if (type_of_game === "drill") {
              player.stats.drill_made--;
              player.stats.drill_attempts--;
            } else {
              player.stats.points.made[points]--;
              state[team].score -= parseInt(points);
            }
            break;
          }
          case 'addAttemptedShot': {
            const { team, playerId, points, type_of_game } = lastAction;
            const player = state[team].players[playerId];
            if (type_of_game === "drill") {
              player.stats.drill_attempts--;
            } else {
              player.stats.points.attempted[points]--;
            }
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
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const { addAttemptedShot, addMadeShot, addPlayer, addRebound, addAssist, addFoul, updateLastActions, undoLastAction, initializeGame } = gameSlice.actions;

export default gameSlice.reducer;
