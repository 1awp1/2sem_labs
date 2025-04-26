import { User } from "./user";

export interface AuthData {
  token: string;
  user: User;
  username: string;
}
