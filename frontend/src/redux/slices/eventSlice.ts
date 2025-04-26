import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEvents } from "@/api/eventService";
import { Event } from "@/types/event";

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  isLoading: false,
  error: null,
};

export const fetchEventsList = createAsyncThunk("events/fetch", async (_, { rejectWithValue }) => {
  try {
    return await getEvents();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Неизвестная ошибка");
  }
});

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventsList.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchEventsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default eventSlice.reducer;
