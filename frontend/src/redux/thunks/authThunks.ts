import { createAsyncThunk } from '@reduxjs/toolkit';
import { register, verifyToken } from '@/api/authService'; // Убрали неиспользуемый login
import { RegisterFormValues } from '@/types/user';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (values: RegisterFormValues, { rejectWithValue }) => {
    try {
      await register(values);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Неизвестная ошибка');
    }
  }
);

export const verifyUserToken = createAsyncThunk(
  'auth/verify',
  async (token: string, { rejectWithValue }) => {
    try {
      return await verifyToken(token);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Неизвестная ошибка');
    }
  }
);


export { verifyToken };
