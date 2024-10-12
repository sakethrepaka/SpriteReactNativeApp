import { createSlice } from "@reduxjs/toolkit";

const actionsSlice = createSlice({
  name: "actions",
  initialState: {},
  reducers: {
    addAction: (state, action) => {
      const { spriteId, actionText } = action.payload;
      if (!state[spriteId]) {
        state[spriteId] = [];
      }
      if (actionText && actionText !== "") {
        state[spriteId].push(actionText);
      }
    },
    resetActions: (state, action) => {
      const { spriteId } = action.payload;
      state[spriteId] = [];
    },
    deleteAction: (state, action) => {
      const { spriteId, actionText } = action.payload;
      if (state[spriteId]) {
        state[spriteId] = state[spriteId].filter(
          (item) => item.id !== actionText.id
        );
      }
    },
    deleteSprite: (state, action) => {
      const { spriteId } = action.payload;

      if (state[spriteId]) {
        delete state[spriteId];
      }
    },
  },
});

export const { addAction, resetActions, deleteAction, deleteSprite } =
  actionsSlice.actions;
export default actionsSlice.reducer;
