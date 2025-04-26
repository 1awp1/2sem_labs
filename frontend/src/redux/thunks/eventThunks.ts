import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createEvent as createEventApi,
  updateEvent as updateEventApi,
} from "@/api/eventService"; // Убрали неиспользуемый deleteEventApi
import { EventFormValues } from "@/types/event";
import axios from "axios";

export const createNewEvent = createAsyncThunk(
  "events/create",
  async (
    { eventData, userId }: { eventData: EventFormValues; userId: number },
    { rejectWithValue }
  ) => {
    try {
      return await createEventApi(eventData, userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Неизвестная ошибка");
    }
  }
);

export const updateExistingEvent = createAsyncThunk(
  "events/update",
  async (
    { id, eventData, userId }: { id: number; eventData: EventFormValues; userId: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateEventApi(id, eventData, userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Неизвестная ошибка");
    }
  }
);
export const fetchEventsList = createAsyncThunk(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/events");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Неизвестная ошибка");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/events/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Неизвестная ошибка");
    }
  }
);
