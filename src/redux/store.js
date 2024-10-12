import { combineReducers,configureStore } from "@reduxjs/toolkit";
import { gameSlice } from "./game-reducer";
import { userSlice } from "./user-reducer";

const rootReducer = combineReducers( {
  game: gameSlice.reducer,
  user: userSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
