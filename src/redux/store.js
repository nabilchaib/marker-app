import { combineReducers,configureStore } from "@reduxjs/toolkit";
import { gameSlice } from "./reducer";

const rootReducer = combineReducers( {
  game: gameSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
