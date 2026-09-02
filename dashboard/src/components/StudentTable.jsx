import { RiskBadge } from "./RiskBadge";
import { TrendIndicator } from "./TrendIndicator";

export function StudentTable({ students, onSelect }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Student</th>
          <th>Class</th>
          <th>Mentor</th>
          <th>Risk</th>
          <th>Attendance</th>
          <th>Score</th>
          <th>Failing Subjects</th>
          <th>Fee Overdue</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.student_id} onClick={() => onSelect(s.student_id)} style={{ cursor: "pointer" }}>
            <td>{s.student_name}<br /><small>{s.student_id}</small></td>
            <td>{s.class_section} · {s.stream}</td>
            <td>{s.mentor_name}</td>
            <td><RiskBadge probability={s.dropout_probability} riskBand={s.risk_band} /></td>
            <td>{s.has_attendance ? `${s.latest_attendance_pct}%` : "Not available"} {s.has_attendance && <TrendIndicator value={s.attendance_trend} />}</td>
            <td>{s.has_assessment ? s.avg_score_latest : "Not available"} {s.has_assessment && <TrendIndicator value={s.score_trend} />}</td>
            <td>{s.subjects_failing_now}</td>
            <td>{s.max_days_overdue > 0 ? `${s.max_days_overdue} days` : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}