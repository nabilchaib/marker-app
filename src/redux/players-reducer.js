import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: {}
};

export const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    addPlayer: (state, action) => {
      const { player } = action.payload;
      state.byId[player.id] = player;
      state.allIds.push(player.id);
    },
    editPlayer: (state, action) => {
      const { player } = action.payload;
      state.byId[player.id] = player;
    },
    deletePlayer: (state, action) => {
      const { player } = action.payload;
      state.byId[player.id] = null;
      state.allIds = state.allIds.filter(id => id !== player.id);
    },
    addPlayers: (state, action) => {
      const { players } = action.payload;
      return players.reduce((playersState, player) => {
        return {
          editing: {
            ...state.editing
          },
          byId: {
            ...playersState.byId,
            [player.id]: player
          },
          allIds: [...playersState.allIds, player.id]
        };
      }, initialState);
    },
    addPlayerCache: (state, action) => {
      const { player } = action.payload;
      const { id, avatar, avatarUrl, createdBy, name, number } = player;
      if (id) {
        state.editing.id = id;
      }

      if (name || name === '') {
        state.editing.name = name;
      }

      if (avatar) {
        state.editing.avatar = avatar;
      }

      if (avatarUrl) {
        state.editing.avatarUrl = avatarUrl;
      }

      if (number || number === '') {
        state.editing.number = number;
      }

      if (createdBy) {
        state.editing.createdBy = createdBy;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const { addPlayer, editPlayer, deletePlayer, addPlayers, addPlayerCache } = playersSlice.actions;

export default playersSlice.reducer;
