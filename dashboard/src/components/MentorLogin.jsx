import { useState } from "react";
import { login } from "../api/students";

export function MentorLogin({ onLogin }) {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      onLogin(await login(accountId.trim(), password));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-art" aria-hidden="true">
        <span className="login-art__sun" />
        <span className="login-art__path" />
        <div className="login-art__copy">
          <p className="eyebrow">Student Success Intelligence</p>
          <h1>Every learner deserves an early start.</h1>
          <p>A unified intelligence platform for mentors and school leaders to spot risk patterns, diagnose root causes, and guide student success.</p>
        </div>
      </div>

      <section className="login-panel">
        <div className="school-mark">
          <span>✦</span>
          <div>
            <strong>Northstar Academy</strong>
            <small>Student Risk & Early Warning Platform</small>
          </div>
        </div>

        <div className="login-heading">
          <p className="eyebrow">Secure Access Portal</p>
          <h2>Welcome Back</h2>
          <p>Sign in with your institutional credentials to open your student success workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            User Account ID
            <input
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              placeholder="e.g. principal or mentor-anita"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Enter Workspace"}
            <span>↗</span>
          </button>
        </form>

        <div style={{ marginTop: "18px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px", color: "#94a3b8", lineHeight: "1.6" }}>
          <strong style={{ color: "#2dd4bf", display: "block", marginBottom: "4px" }}>🔑 Access Credentials:</strong>
          <div>• <strong>Principal</strong> (All students): <code>principal</code> / <code>principal123</code></div>
          <div>• <strong>Mentor Anita</strong> (Assigned cohort): <code>mentor-anita</code> / <code>change-me</code></div>
          <div>• <strong>Mentor Rohan</strong> (Assigned cohort): <code>mentor-rohan</code> / <code>mentor123</code></div>
        </div>

        <p className="login-footnote">
          🔒 Secure authentication. Your view is automatically scoped to your assigned cohort and role.
        </p>
      </section>
    </main>
  );
}
