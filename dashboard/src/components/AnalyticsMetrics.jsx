export function AnalyticsMetrics({ students }) {
  const totalStudents = students.length;
  const highRisk = students.filter((s) => s.risk_band === "red" || (s.dropout_probability !== null && s.dropout_probability >= 0.7)).length;
  const attendanceRecords = students.filter((student) => student.has_attendance);
  const assessmentRecords = students.filter((student) => student.has_assessment);
  const avgAttendance = attendanceRecords.length
    ? `${(attendanceRecords.reduce((sum, student) => sum + Number(student.latest_attendance_pct), 0) / attendanceRecords.length).toFixed(1)}%`
    : "No data";
  const avgScore = assessmentRecords.length
    ? (assessmentRecords.reduce((sum, student) => sum + Number(student.avg_score_latest), 0) / assessmentRecords.length).toFixed(1)
    : "No data";
  const withFeeOverdue = students.filter((s) => s.max_days_overdue > 0).length;

  const metrics = [
    { label: "Total Students", value: totalStudents, color: "#3b82f6", icon: "👥" },
    { label: "High Risk", value: highRisk, color: "#dc2626", icon: "⚠️" },
    { label: "Avg Attendance", value: avgAttendance, color: "#10b981", icon: "📍" },
    { label: "Avg Score", value: avgScore, color: "#f59e0b", icon: "📊" },
    { label: "Fee Overdue", value: withFeeOverdue, color: "#6366f1", icon: "💳" },
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
