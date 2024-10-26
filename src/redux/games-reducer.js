import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  editing: {
    teamA: null,
    teamB: null
  }
};

export const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    addGameToCache: (state, action) => {
      const { teamA, teamB } = action.payload;
      if (teamA) {
        state.editing.teamA = teamA;
      }

      if (teamB) {
        state.editing.teamB = teamB;
      }
    },
    removeGameFromCache: (state, action) => {
      const { type } = action.payload;
      if (type === 'teamA') {
        state.editing.teamA = null;
      } else {
        state.editing.teamB = null;
      }
    },
    resetGameCache: (state) => {
      state.editing = initialState.editing;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('resetStore', () => initialState);
  }
});

export const {
  addGameToCache,
  removeGameFromCache,
  resetGameCache,
} = gamesSlice.actions;

export default gamesSlice.reducer;
