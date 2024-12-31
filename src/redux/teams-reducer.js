import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: {
    id: null,
    name: '',
    avatar: null,
    avatarUrl: null,
    players: [],
    createdBy: null
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
    editTeam: (state, action) => {
      const { team } = action.payload;
      state.byId[team.id] = team;
    },
    deleteTeam: (state, action) => {
      const { team } = action.payload;
      state.byId[team.id] = null;
      state.allIds = state.allIds.filter(id => id !== team.id);
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
      state.editing.players.push(player.id);
    },
    removePlayerFromTeamCache: (state, action) => {
      const { player } = action.payload;
      state.editing.players = state.editing.players.filter(id => id !== player.id);
    },
    addTeamCache: (state, action) => {
      const { team } = action.payload;
      const { name, avatar, avatarUrl, players, id, createdBy } = team;
      if (id) {
        state.editing.id = id;
      }

      if (typeof name === 'string') {
        state.editing.name = name;
      }

      if (avatar) {
        state.editing.avatar = avatar;
      }

      if (avatarUrl) {
        state.editing.avatarUrl = avatarUrl;
      }

      if (players) {
        state.editing.players = players;
      }

      if (createdBy) {
        state.editing.createdBy = createdBy;
      }
    },
    resetTeamCache: (state) => {
      state.editing = initialState.editing;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
    builder.addCase('players/deletePlayer', (state, action) => {
      const { player } = action.payload;
      state.editing.players = state.editing.players.filter(id => id !== player.id);
    });
  }
});

export const {
  addTeam,
  editTeam,
  deleteTeam,
  addTeams,
  addTeamCache,
  addPlayerToTeamCache,
  removePlayerFromTeamCache,
  resetTeamCache,
} = teamsSlice.actions;

export default teamsSlice.reducer;
