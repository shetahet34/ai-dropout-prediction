import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ClassPerformanceChart({ students }) {
  const measuredStudents = students.filter((student) => student.has_attendance || student.has_assessment);
  if (!measuredStudents.length) {
    return <div className="empty-chart"><h3>Class Performance Comparison</h3><p>Data not available.</p></div>;
  }

  const groups = students.reduce((result, student) => {
    const key = `${student.class_section} (${student.stream})`;
    if (!result[key]) result[key] = { class: key, attendanceTotal: 0, attendanceCount: 0, scoreTotal: 0, scoreCount: 0 };
    if (student.has_attendance) { result[key].attendanceTotal += student.latest_attendance_pct; result[key].attendanceCount += 1; }
    if (student.has_assessment) { result[key].scoreTotal += student.avg_score_latest; result[key].scoreCount += 1; }
    return result;
  }, {});

  const data = Object.values(groups).map((group) => ({
    class: group.class,
    attendance: group.attendanceCount ? Number((group.attendanceTotal / group.attendanceCount).toFixed(1)) : null,
    score: group.scoreCount ? Number((group.scoreTotal / group.scoreCount).toFixed(1)) : null,
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
        <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "16px", fontWeight: "700" }}>
          🏫 Section & Stream Performance Comparison
        </h3>
        <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
          Comparative average attendance (%) and exam score across sections.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#cbdde0" }} stroke="#9ab3b8" />
            <YAxis domain={[0, 100]} stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} />
            <Tooltip
              cursor={{ fill: "rgba(45, 212, 191, 0.08)" }}
              contentStyle={{
                background: "#081723",
                border: "1px solid #2dd4bf",
                borderRadius: "8px",
                color: "#f4fafb",
                fontSize: "12px",
              }}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ color: "#cbdde0", fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="attendance" name="Avg Attendance (%)" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            <Bar dataKey="score" name="Avg Assessment Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
