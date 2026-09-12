export interface Message {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

export interface User {
  username: string;
}

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch("/api/health");
  return res.json();
}

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch("/api/messages");
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function fetchMessage(id: number): Promise<Message> {
  const res = await fetch(`/api/messages/${id}`);
  if (!res.ok) throw new Error("Failed to fetch message");
  return res.json();
}

export async function fetchLatestMessage(): Promise<Message | null> {
  const res = await fetch("/api/messages/latest");
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

export async function createMessage(username: string, message: string): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, message }),
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}
