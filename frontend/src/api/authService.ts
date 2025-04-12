import axios from "./axios";
import { AuthUser, LoginFormValues, RegisterFormValues, User } from "@/types/user";
import { AxiosResponse } from "axios";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    username?: string;
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
      username: response.data.user.username || response.data.user.name,
      email: response.data.user.email,
      name: response.data.user.name,
      token: response.data.token,
    },
    token: response.data.token,
  };
};

export const register = async (values: RegisterFormValues): Promise<void> => {
  await axios.post(
    "/auth/register",
    {
      name: values.name,
      email: values.email,
      username: values.username,
      password: values.password,
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
