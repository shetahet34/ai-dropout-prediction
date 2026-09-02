import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function MentorAnalysis({ students }) {
  const [showTopOnly, setShowTopOnly] = useState(true);

  const mentorData = {};

  students.forEach((s) => {
    const name = s.mentor_name || "Unassigned";
    if (!mentorData[name]) {
      mentorData[name] = {
        mentor: name,
        total: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
      };
    }

    mentorData[name].total++;
    const prob = Number(s.dropout_probability || 0);

    if (s.risk_band === "red" || prob >= 0.7) {
      mentorData[name].highRisk++;
    } else if (s.risk_band === "amber" || prob >= 0.4) {
      mentorData[name].mediumRisk++;
    } else {
      mentorData[name].lowRisk++;
    }
  });

  const allSorted = Object.values(mentorData).sort(
    (a, b) => b.highRisk - a.highRisk || b.mediumRisk - a.mediumRisk || b.total - a.total
  );

  const displayData = showTopOnly ? allSorted.slice(0, 10) : allSorted.slice(0, 20);

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(145deg, #0e2436, #091926)",
        border: "1px solid rgba(45, 212, 191, 0.3)",
        padding: "20px",
        borderRadius: "14px",
        boxShadow: "0 14px 28px rgba(0,0,0,.25)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "16px", fontWeight: "700" }}>
            👥 Mentor Risk Caseload Distribution
          </h3>
          <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
            {showTopOnly ? "Top 10 Mentors with Highest High-Risk Volume (≥70%)" : "Top 20 Mentors Overview"}
          </p>
        </div>
        <button
          onClick={() => setShowTopOnly(!showTopOnly)}
          style={{
            background: "rgba(45, 212, 191, 0.12)",
            border: "1px solid #2dd4bf",
            color: "#6fe0cb",
            padding: "5px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showTopOnly ? "View Top 20" : "View Top 10"}
        </button>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            layout="vertical"
          >
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis type="number" stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} allowDecimals={false} />
            <YAxis
              dataKey="mentor"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: "#cbdde0" }}
              stroke="#9ab3b8"
            />
            <Tooltip
              formatter={(value, name) => [`${value} students`, name]}
              cursor={{ fill: "rgba(45, 212, 191, 0.08)" }}
              contentStyle={{
                backgroundColor: "#081723",
                border: "1px solid #2dd4bf",
                borderRadius: "8px",
                color: "#f4fafb",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#2dd4bf", fontWeight: "700" }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                color: "#cbdde0",
                fontSize: "12px",
                paddingTop: "6px",
              }}
            />
            <Bar dataKey="highRisk" stackId="a" fill="#ef4444" name="High Risk (≥70%)" />
            <Bar dataKey="mediumRisk" stackId="a" fill="#f59e0b" name="Medium Risk (40-69%)" />
            <Bar dataKey="lowRisk" stackId="a" fill="#10b981" name="Safe (<40%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
