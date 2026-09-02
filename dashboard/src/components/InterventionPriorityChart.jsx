import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#fb7185", "#fbbf24", "#a78bfa", "#38bdf8"];

export function InterventionPriorityChart({ students }) {
  const data = [
    { issue: "Low attendance", count: students.filter((s) => s.latest_attendance_pct < 70).length, action: "Contact student and guardian" },
    { issue: "Failing subjects", count: students.filter((s) => s.subjects_failing_now > 0).length, action: "Schedule academic support" },
    { issue: "Fee overdue", count: students.filter((s) => s.max_days_overdue > 30).length, action: "Arrange finance follow-up" },
    { issue: "Scores declining", count: students.filter((s) => s.score_trend < 0).length, action: "Review learning progress" },
  ];

  return <div style={{ width: "100%", height: 330, padding: "18px", borderRadius: "14px", background: "linear-gradient(145deg, #0f2b50, #172554)", border: "1px solid #2563eb", boxShadow: "0 14px 28px rgba(0,0,0,.25)" }}>
    <h3 style={{ color: "#dbeafe", margin: "0 0 6px" }}>Intervention Priorities</h3>
    <p style={{ color: "#93c5fd", fontSize: "12px", margin: "0 0 8px" }}>Number of students needing each type of follow-up.</p>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
        <CartesianGrid stroke="#31547e" strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} stroke="#b9d7ff" />
        <YAxis dataKey="issue" type="category" width={105} stroke="#dbeafe" fontSize={12} />
        <Tooltip formatter={(value, _name, item) => [`${value} students`, item.payload.action]} cursor={{ fill: "rgba(255, 255, 255, 0.12)" }} contentStyle={{ background: "#0f172a", border: "1px solid #5281bb", borderRadius: "8px", color: "#f8fafc" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#f8fafc" }} />
        <Bar dataKey="count" radius={[0, 7, 7, 0]}>{data.map((item, index) => <Cell key={item.issue} fill={colors[index]} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
