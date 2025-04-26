export interface User {
  id: number;
  name: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  username: string;
  gender?: 'male' | 'female' | 'other' | null;
  birthDate?: string | null;
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
    lastName: string;
    middleName?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    birthDate?: string | null;
  };
  token: string;
}

export interface RegisterFormValues {
  name: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  username: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
