import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createMessage, fetchLatestMessage, fetchMessages, type Message } from "../api";
import { getUsername } from "../auth";

function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [username] = useState(getUsername);
  const lastIdRef = useRef(0);

  useEffect(() => {
    fetchMessages()
      .then((msgs) => {
        setMessages(msgs);
        lastIdRef.current = msgs.reduce((max, m) => Math.max(max, m.id), 0);
      })
      .catch(() => setError("Failed to load messages"));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const latest = await fetchLatestMessage();
        if (latest && latest.id > lastIdRef.current) {
          lastIdRef.current = latest.id;
          setMessages((prev) => [...prev, latest]);
        }
      } catch {
        return;
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    if (!username) {
      setError("Log in first, then post.");
      return;
    }
    try {
      const message = await createMessage(content.trim());
      setMessages((prev) => [...prev, message]);
      setContent("");
      setError("");
    } catch {
      setError("Failed to post message");
    }
  }

  return (
    <div className="app">
      <main className="main">
        <section className="board">
          <h1>Message Board</h1>
          {error && <p className="login-error">{error}</p>}
          <div className="board-messages">
            {/* TODO: group temporally contiguous messages from a single user under one username banner */}
            {messages.length === 0 ? (
              <p className="board-empty">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <article
                  className={`board-message ${m.username === username ? "own" : ""}`}
                  key={m.id}
                >
                  <span className="board-author">{m.username}</span>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.message}
                  </ReactMarkdown>
                  <time className="board-time">
                    {new Date(m.created_at).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </article>
              ))
            )}
          </div>
          <form onSubmit={handleSubmit} className="board-form">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message... (Markdown supported)"
              rows={3}
            />
            <button type="submit" disabled={!content.trim()}>
              Post
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default MessageBoard;