import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function PerformanceMomentumChart({ students }) {
  // Categorize students by score tier and momentum (score delta)
  const momentumData = {
    "Critical (<40)": { improving: 0, stable: 0, declining: 0, total: 0 },
    "Average (40-59)": { improving: 0, stable: 0, declining: 0, total: 0 },
    "Good (60-79)": { improving: 0, stable: 0, declining: 0, total: 0 },
    "Excellent (80+)": { improving: 0, stable: 0, declining: 0, total: 0 },
  };

  students.forEach((student) => {
    const currentScore = Number(student.avg_score_latest ?? 0);
    const previousScore = Number(student.avg_score_previous ?? currentScore);
    const momentum = currentScore - previousScore;
    
    let tier = "Critical (<40)";
    if (currentScore >= 80) tier = "Excellent (80+)";
    else if (currentScore >= 60) tier = "Good (60-79)";
    else if (currentScore >= 40) tier = "Average (40-59)";

    momentumData[tier].total++;
    if (momentum > 2.0) momentumData[tier].improving++;
    else if (momentum < -2.0) momentumData[tier].declining++;
    else momentumData[tier].stable++;
  });

  const chartData = Object.entries(momentumData).map(([tier, v]) => ({
    tier,
    improving: v.improving,
    stable: v.stable,
    declining: v.declining,
    total: v.total,
  }));

  const totalImproving = chartData.reduce((sum, d) => sum + d.improving, 0);
  const totalStable = chartData.reduce((sum, d) => sum + d.stable, 0);
  const totalDeclining = chartData.reduce((sum, d) => sum + d.declining, 0);
  const totalStudents = students.length || 1;

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(145deg, #101c2e, #17283c)",
        border: "1px solid #3b82f6",
        padding: "20px",
        borderRadius: "14px",
        boxShadow: "0 14px 28px rgba(0,0,0,.25)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ color: "#e0e7ff", margin: 0, fontSize: "16px", fontWeight: "700" }}>
            📈 Performance Momentum Analysis
          </h3>
          <span style={{ fontSize: "11px", color: "#93c5fd", fontWeight: "600" }}>
            Term-over-Term Trajectory
          </span>
        </div>
        <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: "12px" }}>
          Distribution of students gaining, maintaining, or losing academic momentum across score tiers.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
          >
            <CartesianGrid stroke="#263852" strokeDasharray="3 3" />
            <XAxis 
              dataKey="tier" 
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#cbd5e1" }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#cbd5e1" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #3b82f6",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#93c5fd", fontWeight: "700", marginBottom: "4px" }}
              formatter={(value, name) => [
                `${value} students (${((value / totalStudents) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                color: "#cbd5e1",
                fontSize: "12px",
                paddingTop: "8px",
              }}
            />
            <Bar 
              dataKey="improving" 
              name="Improving (Gain > 2 pts)" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="stable" 
              name="Stable (Within ±2 pts)" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="declining" 
              name="Declining (Drop > 2 pts)" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          paddingTop: "12px",
          borderTop: "1px solid #263852",
        }}
      >
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
          <div style={{ color: "#34d399", fontSize: "20px", fontWeight: "800" }}>
            {totalImproving}
          </div>
          <div style={{ color: "#a7f3d0", fontSize: "11px", marginTop: "2px", fontWeight: "600" }}>
            Improving ({((totalImproving / totalStudents) * 100).toFixed(1)}%)
          </div>
        </div>

        <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
          <div style={{ color: "#60a5fa", fontSize: "20px", fontWeight: "800" }}>
            {totalStable}
          </div>
          <div style={{ color: "#bfdbfe", fontSize: "11px", marginTop: "2px", fontWeight: "600" }}>
            Stable ({((totalStable / totalStudents) * 100).toFixed(1)}%)
          </div>
        </div>

        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
          <div style={{ color: "#f87171", fontSize: "20px", fontWeight: "800" }}>
            {totalDeclining}
          </div>
          <div style={{ color: "#fecaca", fontSize: "11px", marginTop: "2px", fontWeight: "600" }}>
            Declining ({((totalDeclining / totalStudents) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
