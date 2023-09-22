import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeData: (state, action) => {
      const { teams } = action.payload;
      state.teamA = teams.teamA;
      state.teamB = teams.teamB;
    },
    addPlayer: (state, action) => {
      const { team, player } = action.payload;
      state[team].players.push(player);
    },
    addAttemptedShot: (state, action) => {
      const { team, playerId, points } = action.payload;
      const player = state[team].players.find((p) => p.id === playerId);
      player.stats.points.attempted[points]++;

    },
    addMadeShot: (state, action) => {
      const { team, playerId, points } = action.payload;
      const player = state[team].players.find((p) => p.id === playerId);
      player.stats.points.made[points]++;
      state[team].score += parseInt(points);
    },
    addRebound: (state, action) => {
      const { team, playerId, type } = action.payload;
      const player = state[team].players.find((p) => p.id === playerId);
      player.stats.rebounds[type]++;
    },
    addAssist: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players.find((p) => p.id === playerId);
      player.stats.assists++;
    },
    addFoul: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players.find((p) => p.id === playerId);
      player.stats.fouls++;
    },

    updateLastActions: (state, action) => {
      state.lastActions = action.payload;
      // console.log(state.lastActions);
    },

    undoLastAction: (state, action) => {
      state.lastActions = action.payload;
      const lastAction = state.lastActions.lastActions[state.lastActions.lastActions.length - 1]


      if (lastAction) {
        switch (lastAction.action) {
          case 'addMadeShot': {
            const { team, playerId, points } = lastAction;
            const player = state[team].players.find((p) => p.id === playerId);
            player.stats.points.made[points]--;
            state[team].score -= parseInt(points);
            break;
          }
          case 'addAttemptedShot': {
            const { team, playerId, points } = lastAction;
            const player = state[team].players.find((p) => p.id === playerId);
            player.stats.points.attempted[points]--;
            break;
          }
          case 'addRebound': {
            const { team: rTeam, playerId: rPlayerId, type: rType } = lastAction;
            const rPlayer = state[rTeam].players.find((p) => p.id === rPlayerId);
            rPlayer.stats.rebounds[rType]--;
            break;
          }
          case 'addAssist': {
            const { team: aTeam, playerId: aPlayerId } = lastAction;
            const aPlayer = state[aTeam].players.find((p) => p.id === aPlayerId);
            aPlayer.stats.assists--;
            break;
          }
          case 'addFoul': {
            const { team: fTeam, playerId: fPlayerId } = lastAction;
            const fPlayer = state[fTeam].players.find((p) => p.id === fPlayerId);
            fPlayer.stats.fouls--;
            break;
          }
          default:
            break;
        }
      }
    }
  },
});

export const { addAttemptedShot, addMadeShot, addPlayer, addScore, addRebound, addAssist, addFoul, updateLastActions, undoLastAction, initializeData } = gameSlice.actions;

export default gameSlice.reducer;
