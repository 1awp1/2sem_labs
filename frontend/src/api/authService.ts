import axios from "./axios";
import { AuthUser, LoginFormValues, RegisterFormValues, User } from "@/types/user";
import { AxiosResponse } from "axios";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    middleName?: string | null;
    email: string;
    username: string;
    gender?: 'male' | 'female' | 'other' | null;
    birthDate?: string | null;
  };
}

export const login = async (values: LoginFormValues): Promise<AuthUser> => {
  const response: AxiosResponse<LoginResponse> = await axios.post("/auth/login", {
    email: values.email,
    password: values.password,
  });

  return {
    user: {
      id: response.data.user.id,
      username: response.data.user.username,
      email: response.data.user.email,
      name: response.data.user.name,
      lastName: response.data.user.lastName,
      middleName: response.data.user.middleName || undefined,
      gender: response.data.user.gender || undefined,
      birthDate: response.data.user.birthDate || undefined,
    },
    token: response.data.token,
  };
};

export const register = async (values: RegisterFormValues): Promise<void> => {
  await axios.post(
    "/auth/register",
    {
      name: values.name,
      lastName: values.lastName,
      middleName: values.middleName || null,
      email: values.email,
      username: values.username,
      password: values.password,
      gender: values.gender,
      birthDate: values.birthDate,
    },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await axios.get("/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    return false;
  }
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await axios.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const getUserEvents = async (token: string): Promise<Event[]> => {
  const response = await axios.get("/events/my-events", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const updateUser = async (
  id: number,
  userData: Partial<User>,
  token: string
): Promise<User> => {
  const response = await axios.put(`/users/${id}`, {
    ...userData,
    gender: userData.gender || null,
    birthDate: userData.birthDate || null,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};