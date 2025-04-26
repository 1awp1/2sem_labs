//localStorageUtils.ts
import { AuthData } from "@/types/auth";
import { AuthUser } from "@/types/user";

export const getAuthData = (): AuthData | null => {
  try {
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading auth data:", error);
    return null;
  }
};

export const setAuthData = (data: AuthUser): void => {
  localStorage.setItem("auth", JSON.stringify(data));
};

export const removeAuthData = (): void => {
  localStorage.removeItem("auth");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthData();
};

export const useAuth = () => {
  return {
    getAuthData,
    isAuthenticated,
    login: setAuthData,
    logout: removeAuthData,
  };
};
export const getToken = (): string | null => {
  const authData = getAuthData();
  return authData?.token || null;
};
