import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createUser, deleteUser, fetchUsers, type AdminUser } from "../api";
import { getUser, isAdmin } from "../auth";

function UserAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setUsers(await fetchUsers());
    } catch {
      setError("Failed to load users");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const roleList = roles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      await createUser(username.trim(), email.trim(), password, roleList);
      setMessage("User created.");
      setUsername("");
      setEmail("");
      setPassword("");
      setRoles("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  async function handleDelete(target: string) {
    setError("");
    setMessage("");
    try {
      await deleteUser(target);
      setMessage(`Deleted ${target}.`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  if (!getUser()) return <Navigate to="/for-campmates" replace />;

  if (!isAdmin()) {
    return (
      <div className="app">
        <main className="main">
          <section className="campmates">
            <h1>Admins only</h1>
            <p>You don&apos;t have permission to view this page.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="main">
        <section className="campmates">
          <h1>User Administration</h1>

          {message && <p className="user-admin-note">{message}</p>}
          {error && <p className="login-error">{error}</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.roles.length ? u.roles.join(", ") : "\u2014"}</td>
                  <td>
                    <button
                      className="admin-delete"
                      onClick={() => handleDelete(u.username)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="admin-subhead">Add User</h2>
          <form onSubmit={handleAdd} className="login-form">
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="newuser"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@camp.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label>
              Roles
              <input
                value={roles}
                onChange={(e) => setRoles(e.target.value)}
                placeholder="admin (comma-separated)"
              />
            </label>
            <button type="submit" disabled={!username.trim() || !email.trim() || !password}>
              Add User
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default UserAdmin;