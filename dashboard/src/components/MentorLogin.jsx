import { useState, useEffect } from "react";
import { login, fetchMentorsDirectory } from "../api/students";

export function MentorLogin({ onLogin }) {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchMentorsDirectory()
      .then((data) => {
        if (Array.isArray(data)) setMentors(data);
      })
      .catch(() => {});
  }, []);

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
          <p>Sign in with your mentor or principal credentials to open your personalized student workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Select Mentor or Principal from Directory
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setAccountId(val);
                  if (val.toLowerCase().includes("principal")) {
                    setPassword("principal123");
                  } else {
                    setPassword("mentor123");
                  }
                }
              }}
              value={mentors.some((m) => m.name === accountId) || accountId === "principal" ? accountId : ""}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#081926",
                border: "1px solid rgba(45, 212, 191, 0.35)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "13px",
                marginBottom: "8px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">-- Choose Account (Principal or Any Mentor) --</option>
              <option value="principal">🎓 School Principal (All School Cohort)</option>
              {mentors.map((m) => (
                <option key={m.name} value={m.name}>
                  🧑‍🏫 {m.name} ({m.count} students assigned)
                </option>
              ))}
            </select>
          </label>

          <label>
            User Account ID
            <input
              list="mentor-directory-datalist"
              value={accountId}
              onChange={(event) => {
                const val = event.target.value;
                setAccountId(val);
                if (val.toLowerCase().includes("principal") && !password) {
                  setPassword("principal123");
                } else if (!password) {
                  setPassword("mentor123");
                }
              }}
              placeholder="e.g. principal, or any mentor name"
              autoComplete="username"
              required
            />
            <datalist id="mentor-directory-datalist">
              <option value="principal">School Principal (All 5,000 Students)</option>
              {mentors.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.count} students)
                </option>
              ))}
            </datalist>
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password (e.g. mentor123)"
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

        <div style={{ marginTop: "16px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px", color: "#94a3b8", lineHeight: "1.6" }}>
          <strong style={{ color: "#2dd4bf", display: "block", marginBottom: "4px" }}>🔑 Universal Access:</strong>
          <div>• <strong>Principal</strong>: <code>principal</code> / <code>principal123</code> (Whole school)</div>
          <div>• <strong>Every Mentor</strong>: Select or type any mentor name / password: <code>mentor123</code></div>
        </div>

        <p className="login-footnote">
          🔒 Secure authentication. Your view is automatically scoped to your assigned cohort and role.
        </p>
      </section>
    </main>
  );
}
