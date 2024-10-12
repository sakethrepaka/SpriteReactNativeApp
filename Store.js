import { configureStore } from "@reduxjs/toolkit";
import actionsReducer from "./slices/spriteSlice";

export const store = configureStore({
  reducer: {
    actions: actionsReducer,
  },
});
