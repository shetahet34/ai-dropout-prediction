import { RiskBadge } from "./RiskBadge";
import { TrendIndicator } from "./TrendIndicator";

export function RiskAnalysisTable({ students, filters, onSelect }) {
  let filtered = students;

  if (filters.riskLevel === "high") {
    filtered = filtered.filter((s) => s.risk_band === "red" || s.dropout_probability >= 0.7);
  } else if (filters.riskLevel === "medium") {
    filtered = filtered.filter((s) => s.risk_band === "amber" || (s.dropout_probability >= 0.4 && s.dropout_probability < 0.7));
  } else if (filters.riskLevel === "low") {
    filtered = filtered.filter((s) => s.risk_band === "green" || s.dropout_probability < 0.4);
  }

  if (filters.class !== "all") {
    filtered = filtered.filter((s) => s.class_section === filters.class);
  }

  if (filters.stream !== "all") {
    filtered = filtered.filter((s) => s.stream === filters.stream);
  }

  if (filters.mentor !== "all") {
    filtered = filtered.filter((s) => s.mentor_name === filters.mentor);
  }

  return (
    <div style={{ background: "#111b2e", color: "#e5edf9", borderRadius: "14px", overflow: "hidden", border: "1px solid #40577f", boxShadow: "0 16px 32px rgba(0, 0, 0, 0.3)" }}>
      <div style={{ padding: "18px", background: "linear-gradient(90deg, #0e7490, #4f46e5, #7c3aed)", borderBottom: "1px solid #637aa2" }}>
        <h3 style={{ margin: 0 }}>Detailed Student Analysis ({filtered.length})</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#0b1220", borderBottom: "2px solid #40577f" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Student</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Class</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Risk Level</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Attendance</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Score</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Failing</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Fee Overdue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <tr key={s.student_id} onClick={() => onSelect?.(s)} style={{ cursor: onSelect ? "pointer" : "default", borderBottom: "1px solid #2e4267", backgroundColor: idx % 2 === 0 ? "#172033" : "#1e2b44" }}>
                <td style={{ padding: "12px", color: "#ffffff" }}>
                  <strong style={{ color: "#ffffff" }}>{s.student_name}</strong>
                  <br />
                  <small style={{ color: "#a9c0e5" }}>{s.student_id}</small>
                </td>
                <td style={{ padding: "12px" }}>
                  {s.class_section} · {s.stream}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <RiskBadge probability={s.dropout_probability} riskBand={s.risk_band} />
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {s.latest_attendance_pct}% <TrendIndicator value={s.attendance_trend} />
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {s.avg_score_latest} <TrendIndicator value={s.score_trend} />
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>{s.subjects_failing_now}</td>
                <td style={{ padding: "12px", textAlign: "center", color: s.max_days_overdue > 0 ? "#dc2626" : "#10b981" }}>
                  {s.max_days_overdue > 0 ? `${s.max_days_overdue}d` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
          No students match the selected filters
        </div>
      )}
    </div>
  );
}
