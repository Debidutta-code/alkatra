export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  user: User | null;
}
