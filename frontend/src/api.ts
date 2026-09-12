import { getToken } from "./auth";

export interface Message {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

export interface User {
  username: string;
  roles: string[];
  token: string;
}

export interface AdminUser {
  username: string;
  email: string;
  roles: string[];
}

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch("/api/health");
  return res.json();
}

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch("/api/messages", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function fetchMessage(id: number): Promise<Message> {
  const res = await fetch(`/api/messages/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch message");
  return res.json();
}

export async function fetchLatestMessage(): Promise<Message | null> {
  const res = await fetch("/api/messages/latest", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch latest message");
  return res.json();
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed.");
  return res.json();
}

export async function createMessage(message: string): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/users", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(
  username: string,
  email: string,
  password: string,
  roles: string[]
): Promise<AdminUser> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ username, email, password, roles }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to create user");
  }
  return res.json();
}

export async function deleteUser(username: string): Promise<void> {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
