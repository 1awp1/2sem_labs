import { createAsyncThunk } from "@reduxjs/toolkit";
import { EventFormValues } from "@/types/event";
import axios from "axios";

export const createNewEvent = createAsyncThunk(
  "events/create",
  async (
    { eventData, userId }: { eventData: EventFormValues; userId: number; },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/events', {
        ...eventData,
        createdBy: userId
      }, {
        params: {
          include: "creator" 
        }
      });
      return response.data;
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
    { id, eventData }: { id: number; eventData: EventFormValues; userId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/events/${id}`, eventData, {
        params: {
          include: "creator" // Явно запрашиваем информацию о создателе
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue("Неизвестная ошибка");
    }
  }
);

export const fetchEventsList = createAsyncThunk(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/events", {
        params: {
          include: "creator" // Явно запрашиваем информацию о создателе
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
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
