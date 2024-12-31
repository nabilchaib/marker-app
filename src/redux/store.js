import { combineReducers,configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { userSlice } from './user-reducer';
import { playersSlice } from './players-reducer'
import { teamsSlice } from './teams-reducer'
import { gamesSlice } from './games-reducer'

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers( {
  user: userSlice.reducer,
  players: playersSlice.reducer,
  teams: teamsSlice.reducer,
  games: gamesSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
// persistor.purge();
