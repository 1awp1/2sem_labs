export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  failed_attempts?: number;
  is_locked?: boolean;
  lock_until?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    token: string;
  };
  token: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
