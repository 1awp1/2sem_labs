import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axios";
import { User } from "@/types/user";

interface UpdateUserArgs {
  id: number;
  userData: Partial<User>;
  token: string;
}

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, userData, token }: UpdateUserArgs, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export const getUserEvents = createAsyncThunk(
  "user/getUserEvents",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/me/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
