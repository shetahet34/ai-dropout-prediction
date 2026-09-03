import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export function MentorInterventionPipelineChart({ students }) {
  const data = useMemo(() => {
    const stages = {
      "Needs outreach": { label: "1. Needs Outreach", count: 0, color: "#ef4444" },
      "Parent contacted": { label: "2. Parent Contacted", count: 0, color: "#f97316" },
      "Remedial tutoring": { label: "3. Remedial Tutoring", count: 0, color: "#eab308" },
      "Fee extension": { label: "4. Fee Extension", count: 0, color: "#8b5cf6" },
      "Resolved / Monitoring": { label: "5. Monitoring / Resolved", count: 0, color: "#10b981" },
    };

    students.forEach((s) => {
      const stage = s.intervention_stage || "Needs outreach";
      if (stages[stage]) {
        stages[stage].count++;
      } else if (stage.toLowerCase().includes("parent")) {
        stages["Parent contacted"].count++;
      } else if (stage.toLowerCase().includes("remedial") || stage.toLowerCase().includes("tutoring")) {
        stages["Remedial tutoring"].count++;
      } else if (stage.toLowerCase().includes("fee")) {
        stages["Fee extension"].count++;
      } else if (stage.toLowerCase().includes("resolved") || stage.toLowerCase().includes("monitor")) {
        stages["Resolved / Monitoring"].count++;
      } else {
        stages["Needs outreach"].count++;
      }
    });

    return Object.values(stages);
  }, [students]);

  const total = students.length || 1;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "15px", fontWeight: "700" }}>
            Intervention Workflow Pipeline
          </h3>
          <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
            Active caseload progression across intervention stages.
          </p>
        </div>
        <span style={{ fontSize: "11px", color: "#2dd4bf", fontWeight: "600" }}>
          Caseload: {students.length} Mentees
        </span>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <XAxis type="number" stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              stroke="#9ab3b8"
              tick={{ fontSize: 11, fill: "#cbdde0" }}
              width={150}
            />
            <Tooltip
              formatter={(value) => [`${value} students (${((value / total) * 100).toFixed(1)}%)`, "Caseload"]}
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
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
