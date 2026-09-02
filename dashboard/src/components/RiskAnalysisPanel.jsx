export function RiskAnalysisPanel({ students, policy }) {
  const attThresh = policy?.attendance ?? 75;
  const feeThresh = policy?.fee_days ?? 30;

  const highRisk = students.filter((s) => s.dropout_probability !== null && (s.dropout_probability >= 0.7 || s.risk_band === "red"));
  const mediumRisk = students.filter((s) => s.dropout_probability !== null && (s.dropout_probability >= 0.4 && s.dropout_probability < 0.7 || s.risk_band === "amber"));
  
  const criticalIssues = students.filter((s) => 
    s.has_attendance && s.has_assessment && s.latest_attendance_pct < 60 && s.subjects_failing_now > 0
  );

  const attendanceConcern = students.filter((s) => 
    s.has_attendance && s.latest_attendance_pct < attThresh
  );

  const feeConcern = students.filter((s) => 
    s.has_fees && s.max_days_overdue > feeThresh
  );

  const scoreImproving = students.filter((s) => s.has_assessment && (s.score_trend || 0) > 0);

  const insights = [
    {
      title: "Critical Dual Risk",
      count: criticalIssues.length,
      description: "Low attendance (<60%) & failing marks",
      color: "#ef4444",
      icon: "🚨",
    },
    {
      title: "Attendance Alert",
      count: attendanceConcern.length,
      description: `Below ${attThresh}% institutional policy target`,
      color: "#f59e0b",
      icon: "📍",
    },
    {
      title: `Fee Arrears (>${feeThresh}d)`,
      count: feeConcern.length,
      description: `Overdue tuition > ${feeThresh} days`,
      color: "#f2bd74",
      icon: "💳",
    },
    {
      title: "Positive Momentum",
      count: scoreImproving.length,
      description: "Showing positive term score gains",
      color: "#2dd4bf",
      icon: "📈",
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0e2436, #091926)",
        border: "1px solid rgba(45, 212, 191, 0.3)",
        color: "#eff8f7",
        padding: "24px",
        borderRadius: "14px",
        marginBottom: "24px",
        boxShadow: "0 16px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p className="eyebrow" style={{ margin: 0 }}>Smart Pattern Detection</p>
        <h2 style={{ margin: "4px 0 0", fontSize: "20px", color: "#f4fafb" }}>
          Diagnostic Risk Matrix & Key Indicators
        </h2>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              padding: "16px",
              background: "#081723",
              border: `1px solid ${insight.color}44`,
              borderLeft: `4px solid ${insight.color}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#9ab3b8", fontWeight: "600" }}>{insight.title}</span>
              <span style={{ fontSize: "20px" }}>{insight.icon}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: insight.color, margin: "6px 0 2px" }}>
              {insight.count}
            </div>
            <div style={{ fontSize: "11px", color: "#cbdde0" }}>{insight.description}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <div style={{ padding: "18px", background: "#081723", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "10px" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#fca5a5", fontSize: "14px", fontWeight: "700" }}>
            🚨 High-Risk Profile ({highRisk.length} Students)
          </h4>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#cbdde0", lineHeight: "1.7" }}>
            <li>Predicted dropout probability ≥ 70% or 2+ triggered policy rules.</li>
            <li>Requires mandatory 1-on-1 mentor outreach & guardian conference.</li>
            <li>Prioritize remedial tutoring in failing subjects.</li>
          </ul>
        </div>

        <div style={{ padding: "18px", background: "#081723", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "10px" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#fde047", fontSize: "14px", fontWeight: "700" }}>
            ⚠️ Medium-Risk Profile ({mediumRisk.length} Students)
          </h4>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#cbdde0", lineHeight: "1.7" }}>
            <li>Predicted dropout probability 40%–69% or 1 triggered rule flag.</li>
            <li>Monitor attendance closely; initiate early academic check-ins.</li>
            <li>Verify fee installment schedule and commute consistency.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
