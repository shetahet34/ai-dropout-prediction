import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

export function RiskCorrelationChart({ students }) {
  const data = students.map((student) => ({
    name: student.student_name,
    attendance: student.latest_attendance_pct,
    risk: Math.round(student.dropout_probability * 100),
    score: student.avg_score_latest,
  }));

  return <div style={{ width: "100%", height: 330, padding: "18px", borderRadius: "14px", background: "linear-gradient(145deg, #0f2b50, #172554)", border: "1px solid #2563eb", boxShadow: "0 14px 28px rgba(0,0,0,.25)" }}>
    <h3 style={{ color: "#dbeafe", margin: "0 0 10px" }}>Attendance vs Dropout Risk</h3>
    <p style={{ color: "#93c5fd", fontSize: "12px", margin: "0 0 8px" }}>Each point is a student; larger points have higher scores.</p>
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart margin={{ top: 12, right: 20, bottom: 8, left: -10 }}>
        <CartesianGrid stroke="#31547e" strokeDasharray="3 3" />
        <XAxis dataKey="attendance" name="Attendance" unit="%" domain={[0, 100]} stroke="#b9d7ff" />
        <YAxis dataKey="risk" name="Dropout risk" unit="%" domain={[0, 100]} stroke="#b9d7ff" />
        <ZAxis dataKey="score" range={[60, 300]} name="Score" />
        <Tooltip cursor={{ stroke: "#bfdbfe", strokeWidth: 1, strokeDasharray: "3 3" }} contentStyle={{ background: "#0f172a", border: "1px solid #5281bb", borderRadius: "8px", color: "#f8fafc" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#f8fafc" }} />
        <Scatter data={data} fill="#f472b6" fillOpacity={0.82} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>;
}
