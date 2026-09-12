export interface AuthUser {
  username: string;
  roles: string[];
  token: string;
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("brothel_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem("brothel_user", JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem("brothel_user");
}

export function getUsername(): string {
  return getUser()?.username ?? "";
}

export function getToken(): string {
  return getUser()?.token ?? "";
}

export function isAdmin(): boolean {
  return getUser()?.roles.includes("admin") ?? false;
}