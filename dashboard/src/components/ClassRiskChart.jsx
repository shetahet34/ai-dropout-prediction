import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ClassRiskChart({ students }) {
  const groups = students.reduce((result, student) => {
    const key = `${student.class_section} (${student.stream})`;
    if (!result[key]) result[key] = { class: key, high: 0, medium: 0, low: 0 };
    if (student.dropout_probability >= 0.7 || student.risk_band === "red") result[key].high += 1;
    else if (student.dropout_probability >= 0.4 || student.risk_band === "amber") result[key].medium += 1;
    else result[key].low += 1;
    return result;
  }, {});

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
          Section Risk Composition
        </h3>
        <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
          Risk tier distribution across class sections.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={Object.values(groups)} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#cbdde0" }} stroke="#9ab3b8" />
            <YAxis allowDecimals={false} stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} />
            <Tooltip
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
            <Legend verticalAlign="bottom" wrapperStyle={{ color: "#cbdde0", fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="high" name="High Risk" stackId="risk" fill="#ef4444" />
            <Bar dataKey="medium" name="Medium Risk" stackId="risk" fill="#f59e0b" />
            <Bar dataKey="low" name="Low Risk" stackId="risk" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
