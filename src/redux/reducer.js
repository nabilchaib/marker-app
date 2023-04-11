import teamData from '../team.json';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ...teamData,
  teamB: {
    name: 'Team B',
    score: 0,
    players: [{
      "name": "Nabil Chaib-draa",
      "id": 9,
      "stats": {
        "points": {
          "attempted": [
            0,
            0,
            0,
            0
          ],
          "made": [
            0,
            0,
            0,
            0
          ]
        },
        "rebounds": {
          "offensive": 0,
          "defensive": 0
        },
        "assists": 0,
        "fouls": 0
      }
    }],
  },
};


export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPlayer: (state, action) => {
      const { team, player } = action.payload;
      state[team].players.push(player);
    },
    addAttemptedShot: (state, action) => {
      console.log(action.payload);
      const { team, playerId, points } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.points.attempted[points]++;

    },
    addMadeShot: (state, action) => {
      const { team, playerId, points } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.points.made[points]++;
      state[team].score += parseInt(points);
    },

    addRebound: (state, action) => {
      const { team, playerId, type } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.rebounds[type]++;
    },
    addAssist: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.assists++;
    },
    addFoul: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
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
          case 'addAttemptedShot':
            case 'addMadeShot':
            const { team, playerId, points } = lastAction;
            const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
            player.stats.points[lastAction.action === 'addAttemptedShot' ? 'attempted' : 'made'][points]--;
            state[team].score -= parseInt(points);
            break;
          case 'addRebound':
            const { team: rTeam, playerId: rPlayerId, type: rType } = lastAction;
            const rPlayer = state[rTeam].players.find((p) => p.id === parseInt(rPlayerId, 10));
            rPlayer.stats.rebounds[rType]--;
            break;
          case 'addAssist':
            const { team: aTeam, playerId: aPlayerId } = lastAction;
            const aPlayer = state[aTeam].players.find((p) => p.id === parseInt(aPlayerId, 10));
            aPlayer.stats.assists--;
            break;
          case 'addFoul':
            const { team: fTeam, playerId: fPlayerId } = lastAction;
            const fPlayer = state[fTeam].players.find((p) => p.id === parseInt(fPlayerId, 10));
            fPlayer.stats.fouls--;
            break;
          default:
            break;
        }
      }
    }
  },
});

export const { addAttemptedShot, addMadeShot, addPlayer, addScore, addRebound, addAssist, addFoul, updateLastActions, undoLastAction } = gameSlice.actions;

export default gameSlice.reducer;
