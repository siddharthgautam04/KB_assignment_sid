// src/services/auth.service.ts
import { api, setAuthToken, getAuthToken } from "./api";
import { LocalStorageService } from "./localStorage.service";

export type Role = "USER" | "ADMIN";
export type User = {
  id: string;
  name: string;
  employeeId?: string | null;
  username?: string | null;
  role: Role;
};
export type AuthResponse = { token: string; user: User };

export const authService = {
  bootstrap() {
    const t = LocalStorageService.getToken();
    if (t) setAuthToken(t);
    return t;
  },

  setToken(token: string | null) {
    setAuthToken(token);
    if (token) LocalStorageService.setToken(token);
    else LocalStorageService.clearToken();
  },

  // users
  async userSignup(input: { name: string; employeeId: string; username?: string }) {
    const r = await api.post<AuthResponse>("/api/auth/user/signup", input);
    authService.setToken(r.token);
    LocalStorageService.setUser(r.user);
    return r;
  },

  async userLogin(input: { employeeId?: string; username?: string }) {
    const r = await api.post<AuthResponse>("/api/auth/user/login", input);
    authService.setToken(r.token);
    LocalStorageService.setUser(r.user);
    return r;
  },

  // admins
  async adminSignup(input: { name: string; username: string; password: string }) {
    const r = await api.post<AuthResponse>("/api/auth/admin/signup", input);
    authService.setToken(r.token);
    LocalStorageService.setUser(r.user);
    return r;
  },

  async adminLogin(input: { username: string; password: string }) {
    const r = await api.post<AuthResponse>("/api/auth/admin/login", input);
    authService.setToken(r.token);
    LocalStorageService.setUser(r.user);
    return r;
  },

  logout() {
    authService.setToken(null);
    LocalStorageService.clearUser();
  },

  // convenience
  isAuthenticated() {
    return !!getAuthToken() || !!LocalStorageService.getToken();
  }
};