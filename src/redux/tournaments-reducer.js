import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: null
};

export const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    addNewTournament: (state, action) => {
      const newTournament = action.payload;
      state.byId[newTournament.id] = newTournament;
      state.allIds.push(newTournament.id);
    },
    deleteTournament: (state, action) => {
      const tournamentId = action.payload;
      state.byId[tournamentId] = null;
      state.allIds = state.allIds.filter(id => id !== tournamentId);
    },
    updateTournament: (state, action) => {
      const { id, updates } = action.payload;
      state.byId[id] = { ...state.byId[id], ...updates };
    },
    setEditingTournament: (state, action) => {
      state.editing = action.payload;
    },
    addGameToTournament: (state, action) => {
      const { tournamentId, gameId, round, matchIndex } = action.payload;
      if (state.byId[tournamentId]) {
        // Find the specified round
        const roundIndex = state.byId[tournamentId].rounds.findIndex(r => r.name === round);
        if (roundIndex >= 0) {
          // Update the game in the specified match
          state.byId[tournamentId].rounds[roundIndex].games[matchIndex].gameId = gameId;
        }
      }
    },
    updateTournamentMatch: (state, action) => {
      const { tournamentId, round, matchIndex, updates } = action.payload;
      if (state.byId[tournamentId]) {
        const roundIndex = state.byId[tournamentId].rounds.findIndex(r => r.name === round);
        if (roundIndex >= 0) {
          state.byId[tournamentId].rounds[roundIndex].games[matchIndex] = {
            ...state.byId[tournamentId].rounds[roundIndex].games[matchIndex],
            ...updates
          };
        }
      }
    },
    advanceTeamInTournament: (state, action) => {
      const { tournamentId, round, matchIndex, teamId, score } = action.payload;
      if (state.byId[tournamentId]) {
        const tournament = state.byId[tournamentId];
        const roundIndex = tournament.rounds.findIndex(r => r.name === round);
        
        if (roundIndex >= 0 && roundIndex < tournament.rounds.length - 1) {
          // Mark current match as completed
          tournament.rounds[roundIndex].games[matchIndex].status = 'completed';
          tournament.rounds[roundIndex].games[matchIndex].winnerId = teamId;
          
          // Determine the next round and match position
          const nextRoundIndex = roundIndex + 1;
          const nextMatchIndex = Math.floor(matchIndex / 2);
          
          // Determine if this team should be placed in the first or second position
          const isFirstTeam = matchIndex % 2 === 0;
          
          // Update the next round's match with the winning team
          if (isFirstTeam) {
            tournament.rounds[nextRoundIndex].games[nextMatchIndex].teamAId = teamId;
            tournament.rounds[nextRoundIndex].games[nextMatchIndex].teamAScore = 0;
          } else {
            tournament.rounds[nextRoundIndex].games[nextMatchIndex].teamBId = teamId;
            tournament.rounds[nextRoundIndex].games[nextMatchIndex].teamBScore = 0;
          }
        }
      }
    },
    updateRoundRobinStandings: (state, action) => {
      const { tournamentId, teamId, wins, losses, points } = action.payload;
      if (state.byId[tournamentId] && state.byId[tournamentId].format === 'round-robin') {
        const teamIndex = state.byId[tournamentId].standings.findIndex(team => team.id === teamId);
        
        if (teamIndex >= 0) {
          state.byId[tournamentId].standings[teamIndex] = {
            ...state.byId[tournamentId].standings[teamIndex],
            wins: (state.byId[tournamentId].standings[teamIndex].wins || 0) + (wins || 0),
            losses: (state.byId[tournamentId].standings[teamIndex].losses || 0) + (losses || 0),
            points: (state.byId[tournamentId].standings[teamIndex].points || 0) + (points || 0)
          };
          
          // Sort standings by wins (or points, depending on tournament rules)
          state.byId[tournamentId].standings.sort((a, b) => 
            (b.points || 0) - (a.points || 0) || (b.wins || 0) - (a.wins || 0)
          );
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const {
  addNewTournament,
  deleteTournament,
  updateTournament,
  setEditingTournament,
  addGameToTournament,
  updateTournamentMatch,
  advanceTeamInTournament,
  updateRoundRobinStandings
} = tournamentsSlice.actions;

export default tournamentsSlice.reducer;