import { useMemo } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

export function MentorRiskQuadrantChart({ students, onSelect }) {
  const { data, stats } = useMemo(() => {
    let critical = 0;
    let struggle = 0;
    let disengaged = 0;
    let thriving = 0;

    const points = students
      .filter((s) => s.latest_attendance_pct != null && s.avg_score_latest != null)
      .map((s) => {
        const att = Number(s.latest_attendance_pct);
        const score = Number(s.avg_score_latest);
        let quadrant = "Thriving";
        let color = "#10b981";

        if (att < 75 && score < 50) {
          quadrant = "Critical Priority";
          color = "#ef4444";
          critical++;
        } else if (att >= 75 && score < 50) {
          quadrant = "Academic Struggle";
          color = "#f97316";
          struggle++;
        } else if (att < 75 && score >= 50) {
          quadrant = "Disengaged Attendance";
          color = "#eab308";
          disengaged++;
        } else {
          thriving++;
        }

        return {
          id: s.student_id,
          name: s.student_name,
          class: s.class_section,
          stream: s.stream,
          attendance: att,
          score: score,
          riskBand: s.risk_band,
          quadrant,
          color,
          rawStudent: s,
        };
      });

    return {
      data: points,
      stats: { critical, struggle, disengaged, thriving, total: points.length },
    };
  }, [students]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#0a1928",
            border: `1px solid ${pt.color}`,
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
            color: "#ffffff",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "13px" }}>{pt.name}</div>
          <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "6px" }}>{pt.id} · Section {pt.class}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div>Attendance: <strong style={{ color: "#38bdf8" }}>{pt.attendance}%</strong></div>
            <div>Score: <strong style={{ color: "#f59e0b" }}>{pt.score} pts</strong></div>
            <div>Classification: <strong style={{ color: pt.color }}>{pt.quadrant}</strong></div>
          </div>
          <div style={{ marginTop: "6px", fontSize: "10px", color: "#2dd4bf", fontWeight: "600" }}>
            Click dot to open profile ↗
          </div>
        </div>
      );
    }
    return null;
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
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "15px", fontWeight: "700" }}>
            Student Risk Quadrant Matrix
          </h3>
          <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
            Attendance % vs. assessment score for assigned mentees.
          </p>
        </div>

        {/* Quadrant Quick Counts */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            🔴 Critical: {stats.critical}
          </span>
          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: "rgba(249, 115, 22, 0.15)", color: "#fdba74", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
            🟠 Academic: {stats.struggle}
          </span>
          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: "rgba(234, 179, 8, 0.15)", color: "#fde047", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
            🟡 Disengaged: {stats.disengaged}
          </span>
          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: "rgba(16, 185, 129, 0.15)", color: "#86efac", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            🟢 Thriving: {stats.thriving}
          </span>
        </div>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 25, left: -10, bottom: 25 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="attendance"
              name="Attendance"
              unit="%"
              domain={[0, 100]}
              stroke="#9ab3b8"
              tick={{ fontSize: 11, fill: "#cbdde0" }}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="Score"
              unit="pts"
              domain={[0, 100]}
              stroke="#9ab3b8"
              tick={{ fontSize: 11, fill: "#cbdde0" }}
            />
            <ReferenceLine x={75} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: "75% Target", fill: "#38bdf8", fontSize: 10, position: "insideTopRight" }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "50 Pass", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              fill="#2dd4bf"
              cursor="pointer"
              onClick={(entry) => {
                if (entry && entry.rawStudent && onSelect) {
                  onSelect(entry.rawStudent);
                }
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
