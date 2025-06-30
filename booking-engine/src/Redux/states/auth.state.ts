export interface User {
  _id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  user: User | null;
}
