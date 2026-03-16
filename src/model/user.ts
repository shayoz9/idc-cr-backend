export type UserRole = "admin" | "user" | "moderator";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
