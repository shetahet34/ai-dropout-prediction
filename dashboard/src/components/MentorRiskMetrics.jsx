export function MentorRiskMetrics({ students }) {
  // Group students by mentor
  const mentorData = {};

  students.forEach((s) => {
    if (!mentorData[s.mentor_name]) {
      mentorData[s.mentor_name] = {
        mentor: s.mentor_name,
        total: 0,
        atRisk: 0,
        highRisk: 0,
        mediumRisk: 0,
      };
    }

    mentorData[s.mentor_name].total++;

    if (s.dropout_probability >= 0.7) {
      mentorData[s.mentor_name].highRisk++;
      mentorData[s.mentor_name].atRisk++;
    } else if (s.dropout_probability >= 0.4) {
      mentorData[s.mentor_name].mediumRisk++;
      mentorData[s.mentor_name].atRisk++;
    }
  });

  const mentorList = Object.values(mentorData).sort((a, b) => b.atRisk - a.atRisk);

  return (
    <div style={{ width: "100%", background: "linear-gradient(145deg, #172033, #1f2d42)", border: "1px solid #3b82f6", borderRadius: "14px", overflow: "hidden", boxShadow: "0 14px 28px rgba(0,0,0,.25)", marginBottom: "24px" }}>
      <div style={{ padding: "18px", background: "linear-gradient(90deg, #1d4ed8, #7c3aed)", borderBottom: "1px solid #5b6a8f" }}>
        <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "16px", fontWeight: "600" }}>👨‍🏫 Mentor Risk Summary</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a2a3a", borderBottom: "2px solid #3b82f6" }}>
              <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#93c5fd" }}>Mentor Name</th>
              <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#93c5fd" }}>Total Students</th>
              <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#93c5fd" }}>High Risk</th>
              <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#93c5fd" }}>Medium Risk</th>
              <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#93c5fd" }}>Total At-Risk</th>
              <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#93c5fd" }}>Risk %</th>
            </tr>
          </thead>
          <tbody>
            {mentorList.map((mentor, idx) => {
              const riskPercentage = ((mentor.atRisk / mentor.total) * 100).toFixed(1);
              const riskColor = riskPercentage >= 50 ? "#ef4444" : riskPercentage >= 30 ? "#f59e0b" : "#10b981";

              return (
                <tr key={mentor.mentor} style={{ borderBottom: "1px solid #2a3d52", backgroundColor: idx % 2 === 0 ? "#172033" : "#1a2d42" }}>
                  <td style={{ padding: "12px", fontWeight: "500", color: "#e5edf9" }}>{mentor.mentor}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ backgroundColor: "#1e3a8a", color: "#60a5fa", padding: "4px 8px", borderRadius: "6px", fontWeight: "500", fontSize: "12px" }}>
                      {mentor.total}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "4px 8px", borderRadius: "6px", fontWeight: "500", fontSize: "12px" }}>
                      {mentor.highRisk}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ backgroundColor: "#78350f", color: "#fcd34d", padding: "4px 8px", borderRadius: "6px", fontWeight: "500", fontSize: "12px" }}>
                      {mentor.mediumRisk}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ backgroundColor: "#7f1d1d", color: "#fecaca", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>
                      {mentor.atRisk}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ backgroundColor: `${riskColor}25`, color: riskColor, padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>
                      {riskPercentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
