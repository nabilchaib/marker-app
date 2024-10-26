import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: {
    name: '',
    avatar: null,
    avatarUrl: null,
    players: {}
  }
};

export const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    addTeam: (state, action) => {
      const { team } = action.payload;
      state.byId[team.id] = team;
      state.allIds.push(team.id);
    },
    addTeams: (state, action) => {
      const { teams } = action.payload;
      return teams.reduce((teamsState, team) => {
        return {
          editing: {
            ...state.editing
          },
          byId: {
            ...teamsState.byId,
            [team.id]: team
          },
          allIds: [...teamsState.allIds, team.id]
        };
      }, initialState);
    },
    addPlayerToTeamCache: (state, action) => {
      const { player } = action.payload;
      const updatedPlayer = { ...player, toAdd: true };
      state.editing.players[player.id] = updatedPlayer;
    },
    removePlayerFromTeamCache: (state, action) => {
      const { player } = action.payload;
      if (state.editing.players[player.id]) {
        state.editing.players[player.id] = null;
      } else {
        const updatedPlayer = { ...player, toRemove: true };
        state.editing.players[player.id] = updatedPlayer;
      }
    },
    addTeamCache: (state, action) => {
      const { name, avatar, avatarUrl } = action.payload;
      if (typeof name === 'string') {
        state.editing.name = name;
      }

      if (avatar && avatarUrl) {
        state.editing.avatar = avatar;
        state.editing.avatarUrl = avatarUrl;
      }
    },
    resetTeamCache: (state) => {
      state.editing = initialState.editing;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const {
  addTeam,
  addTeams,
  addTeamCache,
  addPlayerToTeamCache,
  removePlayerFromTeamCache,
  resetTeamCache,
} = teamsSlice.actions;

export default teamsSlice.reducer;
