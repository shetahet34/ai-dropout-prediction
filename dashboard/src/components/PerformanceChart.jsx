import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PerformanceChart({ students }) {
  const assessedStudents = students.filter((student) => student.has_assessment);
  if (!assessedStudents.length) {
    return <div className="empty-chart"><h3>Score Distribution</h3><p>Assessment data is not available yet.</p></div>;
  }

  const scoreRanges = {
    "0-39": 0,
    "40-59": 0,
    "60-74": 0,
    "75-89": 0,
    "90-100": 0,
  };

  assessedStudents.forEach((s) => {
    const score = Number(s.avg_score_latest || 0);
    if (score < 40) scoreRanges["0-39"]++;
    else if (score < 60) scoreRanges["40-59"]++;
    else if (score < 75) scoreRanges["60-74"]++;
    else if (score < 90) scoreRanges["75-89"]++;
    else scoreRanges["90-100"]++;
  });

  const data = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count,
  }));

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
        gap: "10px",
      }}
    >
      <div>
        <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "15px", fontWeight: "700" }}>
          Assessment Score Distribution
        </h3>
        <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
          Average academic score tiers across the cohort.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis dataKey="range" stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} />
            <YAxis stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} students`, "Enrolled"]}
              cursor={{ fill: "rgba(45, 212, 191, 0.08)" }}
              contentStyle={{
                backgroundColor: "#0a1928",
                border: "1px solid #2dd4bf",
                borderRadius: "8px",
                padding: "8px 14px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
              }}
              itemStyle={{
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
              }}
              labelStyle={{
                color: "#2dd4bf",
                fontSize: "12px",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            />
            <Bar dataKey="count" fill="#2dd4bf" name="Students" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
