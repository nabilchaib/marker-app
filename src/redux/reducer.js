import teamData from '../team.json';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ...teamData,
  teamB: {
    name: 'Team B',
    score: 0,
    players: [ {
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
      const { team, playerId, points } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.points.attempted[points]++;
    },
    addMadeShot: (state, action) => {
      console.log(JSON.stringify(state));
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
      console.log(player);
      player.stats.assists++;
    },
    addFoul: (state, action) => {
      const { team, playerId } = action.payload;
      const player = state[team].players.find((p) => p.id === parseInt(playerId, 10));
      player.stats.fouls++;
    },
  },
});

export const { addAttemptedShot,addMadeShot,addPlayer, addScore, addRebound, addAssist, addFoul } = gameSlice.actions;

export default gameSlice.reducer;
