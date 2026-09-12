import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { setUser } from "../auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/campmates");
    } catch {
      setError("Login failed. What are you even doing?");
    }
  }

  return (
    <div className="app">
      <main className="main">
        <section className="about">
          <h2>For Campmates</h2>
          <p>Sign in to access members-only content.</p>

          <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="••••••••"
                required
              />
            </label>
            <button type="submit" disabled={!email || !password}>
              Sign In
            </button>
            {error && <p className="login-error">{error}</p>}
          </form>
        </section>
      </main>
    </div>
  );
}

export default Login;
