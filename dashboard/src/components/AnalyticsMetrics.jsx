export function AnalyticsMetrics({ students }) {
  const totalStudents = students.length;
  const highRisk = students.filter((s) => s.risk_band === "red" || (s.dropout_probability !== null && s.dropout_probability >= 0.7)).length;
  const attendanceRecords = students.filter((s) => s.latest_attendance_pct !== null && s.latest_attendance_pct !== undefined && !isNaN(Number(s.latest_attendance_pct)));
  const assessmentRecords = students.filter((s) => s.avg_score_latest !== null && s.avg_score_latest !== undefined && !isNaN(Number(s.avg_score_latest)));
  
  const avgAttendance = attendanceRecords.length
    ? `${(attendanceRecords.reduce((sum, s) => sum + Number(s.latest_attendance_pct), 0) / attendanceRecords.length).toFixed(1)}%`
    : "—";
  const avgScore = assessmentRecords.length
    ? `${(assessmentRecords.reduce((sum, s) => sum + Number(s.avg_score_latest), 0) / assessmentRecords.length).toFixed(1)} pts`
    : "—";
  const withFeeOverdue = students.filter((s) => Number(s.max_days_overdue || 0) > 0).length;

  const metrics = [
    { label: "Enrolled Cohort", value: totalStudents.toLocaleString(), color: "#38bdf8", icon: "👥" },
    { label: "High Risk Students", value: highRisk.toLocaleString(), color: "#ef4444", icon: "⚠️" },
    { label: "Cohort Attendance", value: avgAttendance, color: "#10b981", icon: "📍" },
    { label: "Average Score", value: avgScore, color: "#f59e0b", icon: "📊" },
    { label: "Fee Overdue", value: withFeeOverdue.toLocaleString(), color: "#a78bfa", icon: "💳" },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric, idx) => (
        <div
          className="metric-tile"
          key={idx}
          style={{
            "--metric-color": metric.color,
          }}
        >
          <div className="metric-tile__top"><span className="metric-tile__icon">{metric.icon}</span><span className="metric-tile__label">{metric.label}</span></div>
          <div className="metric-tile__value">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
