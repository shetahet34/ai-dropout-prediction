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
          <p>Sign in to open your early warning student success workspace.</p>
        </div>

        {/* 1-Click Fast Access Buttons */}
        <div style={{ marginBottom: "20px", display: "grid", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ⚡ 1-Click Fast Login:
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                setError("");
                try {
                  onLogin(await login("principal", "principal123"));
                } catch (e) {
                  setError(e.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8" }}>🎓 Principal</span>
              <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>All 5,000+ Students</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                setError("");
                try {
                  onLogin(await login("mentor-anita", "change-me"));
                } catch (e) {
                  setError(e.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                background: "rgba(45, 212, 191, 0.12)",
                border: "1px solid rgba(45, 212, 191, 0.35)",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2dd4bf" }}>🧑‍🏫 Mentor</span>
              <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Advisory Cockpit</span>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "11px", color: "#64748b" }}>or sign in manually</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            User Account ID
            <input
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              placeholder="e.g. principal or Mentor D - Mehta"
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

        <p className="login-footnote">
          🔒 Secure authentication. Your view is automatically scoped to your assigned cohort and role.
        </p>
      </section>
    </main>
  );
}
