export interface Message {
  id: number;
  content: string;
  created_at: string;
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

export async function createMessage(content: string): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}
