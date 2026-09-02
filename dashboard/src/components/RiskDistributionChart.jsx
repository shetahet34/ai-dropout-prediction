import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { getRiskLevel } from "../utils/riskLevel";

export function RiskDistributionChart({ students }) {
  const risks = { high: 0, medium: 0, low: 0 };
  
  students.forEach((s) => {
    if (s.dropout_probability >= 0.7 || s.risk_band === "red") risks.high++;
    else if (s.dropout_probability >= 0.4 || s.risk_band === "amber") risks.medium++;
    else risks.low++;
  });

  const data = [
    { name: "High Risk (Red)", value: risks.high, color: "#ef4444" },
    { name: "Medium Risk (Amber)", value: risks.medium, color: "#f59e0b" },
    { name: "Low Risk (Green)", value: risks.low, color: "#10b981" },
  ];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
        <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "16px", fontWeight: "700" }}>
          🎯 Risk Band Distribution
        </h3>
        <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
          Proportion of students in Red, Amber, and Green tiers.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="48%"
              labelLine={false}
              label={renderLabel}
              outerRadius={78}
              innerRadius={36}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#07131f" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} students (${((value / (students.length || 1)) * 100).toFixed(1)}%)`, name]}
              contentStyle={{
                background: "#081723",
                border: "1px solid #2dd4bf",
                borderRadius: "8px",
                color: "#f4fafb",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              formatter={(value, entry) => `${value}: ${entry.payload.value}`}
              wrapperStyle={{ color: "#cbdde0", fontSize: "12px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
