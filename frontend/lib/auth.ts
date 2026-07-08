const TOKEN_KEY = "order_dashboard_token";

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=3600; SameSite=Lax`;
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
