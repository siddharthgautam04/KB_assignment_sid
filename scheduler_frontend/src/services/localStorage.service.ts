
const STORAGE_KEYS = {
  TOKEN: "rbs.token",
  USER: "rbs.user",
} as const;

export class LocalStorageService {
  // ===== TOKEN =====
  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  static setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  static clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  // ===== USER =====
  static getUser<T = any>(): T | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) as T : null;
  }

  static setUser<T = any>(user: T): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // ===== UTIL =====
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}