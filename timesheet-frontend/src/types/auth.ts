export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "partner" | "manager" | "user";
}

export interface AuthResponse {
  token: string;
  user: User;
}