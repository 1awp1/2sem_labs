import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  notification: {
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info";
  };
  isLoading: boolean;
}

const initialState: UIState = {
  notification: {
    isOpen: false,
    message: "",
    type: "info",
  },
  isLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showNotification(
      state,
      action: PayloadAction<{ message: string; type: "success" | "error" | "info" }>
    ) {
      state.notification = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification(state) {
      state.notification.isOpen = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { showNotification, hideNotification, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
