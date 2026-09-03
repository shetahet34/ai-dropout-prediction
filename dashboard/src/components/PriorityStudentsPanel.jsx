import { RiskBadge } from "./RiskBadge";

export function PriorityStudentsPanel({ students, onSelect }) {
  const priorityStudents = [...students]
    .sort((a, b) => (b.dropout_probability || 0) - (a.dropout_probability || 0) || (a.latest_attendance_pct || 100) - (b.latest_attendance_pct || 100))
    .slice(0, 5);

  return (
    <section
      style={{
        marginBottom: "24px",
        padding: "20px",
        borderRadius: "14px",
        background: "linear-gradient(145deg, #0e2436, #091926)",
        border: "1px solid rgba(45, 212, 191, 0.4)",
        boxShadow: "0 14px 28px rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-end",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2 style={{ color: "#f4fafb", margin: 0, fontSize: "16px", fontWeight: "700" }}>
            Priority Intervention Queue
          </h2>
          <p style={{ color: "#9ab3b8", fontSize: "12px", margin: "3px 0 0" }}>
            Highest predicted dropout probability requiring immediate mentor outreach.
          </p>
        </div>
        <span style={{ color: "#2dd4bf", fontSize: "11px", fontWeight: "600" }}>
          Select student to open profile ↗
        </span>
      </div>

      <div style={{ display: "grid", gap: "9px" }}>
        {priorityStudents.map((student, index) => (
          <button
            key={student.student_id}
            onClick={() => onSelect(student)}
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "36px minmax(160px, 1.4fr) minmax(130px, 1fr) auto",
              alignItems: "center",
              gap: "14px",
              textAlign: "left",
              padding: "12px 16px",
              border: "1px solid #1a3a4e",
              borderRadius: "8px",
              background: "#081723",
              color: "#eff8f7",
              cursor: "pointer",
              transition: "border-color 0.2s ease, transform 0.2s ease",
            }}
          >
            <strong style={{ color: "#f2bd74", fontSize: "16px" }}>#{index + 1}</strong>
            <span>
              <strong style={{ display: "block", color: "#f4fafb", fontSize: "13px" }}>
                {student.student_name}
              </strong>
              <small style={{ color: "#7f9ea3", fontSize: "11px" }}>
                {student.student_id} · {student.class_section} {student.stream} · Mentor: {student.mentor_name || "Unassigned"}
              </small>
            </span>
            <span style={{ color: "#cbdde0", fontSize: "12px" }}>
              Attendance:{" "}
              <strong
                style={{
                  color: (student.latest_attendance_pct || 100) < 70 ? "#ef4444" : (student.latest_attendance_pct || 100) < 75 ? "#f59e0b" : "#2dd4bf",
                }}
              >
                {student.latest_attendance_pct != null ? `${student.latest_attendance_pct}%` : "—"}
              </strong>
              {" · "}
              Score: <strong>{student.avg_score_latest != null ? student.avg_score_latest.toFixed(1) : "—"}</strong>
            </span>
            <RiskBadge probability={student.dropout_probability} />
          </button>
        ))}
      </div>
    </section>
  );
}
