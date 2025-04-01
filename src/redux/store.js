import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { userSlice } from './user-reducer';
import { playersSlice } from './players-reducer'
import { teamsSlice } from './teams-reducer'
import { gamesSlice } from './games-reducer'
import { tournamentsSlice } from './tournaments-reducer'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['register'] // Ignore the register function
};

const rootReducer = combineReducers({
  user: userSlice.reducer,
  players: playersSlice.reducer,
  teams: teamsSlice.reducer,
  games: gamesSlice.reducer,
  tournaments: tournamentsSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['register'],
      },
    }),
});

export const persistor = persistStore(store);
// persistor.purge();
