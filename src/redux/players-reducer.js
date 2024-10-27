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
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const { addPlayer, addPlayers } = playersSlice.actions;

export default playersSlice.reducer;
