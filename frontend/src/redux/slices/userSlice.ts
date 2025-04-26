// src/redux/slices/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { getCurrentUser, getUserEvents, updateUser } from "../thunks/userThunks";
import { User } from "@/types/user";
import { Event } from "@/types/event";

interface UserState {
  profile: User | null;
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  events: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(getUserEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
