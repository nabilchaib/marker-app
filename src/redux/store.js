import { combineReducers,configureStore } from '@reduxjs/toolkit';
import { gameSlice } from './game-reducer';
import { userSlice } from './user-reducer';
import { playersSlice } from './players-reducer'
import { teamsSlice } from './teams-reducer'
import { gamesSlice } from './games-reducer'

const rootReducer = combineReducers( {
  game: gameSlice.reducer,
  user: userSlice.reducer,
  players: playersSlice.reducer,
  teams: teamsSlice.reducer,
  games: gamesSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
