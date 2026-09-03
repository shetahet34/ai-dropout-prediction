import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AttendanceTrendChart({ students }) {
  const attendanceRecords = students.filter((student) => student.has_attendance);
  if (!attendanceRecords.length) {
    return <div className="empty-chart"><h3>Attendance Distribution</h3><p>Attendance data is not available yet.</p></div>;
  }

  const attendanceRanges = {
    "<50%": 0,
    "50-69%": 0,
    "70-79%": 0,
    "80-89%": 0,
    "90-100%": 0,
  };

  attendanceRecords.forEach((s) => {
    const pct = Number(s.latest_attendance_pct || 0);
    if (pct < 50) attendanceRanges["<50%"]++;
    else if (pct < 70) attendanceRanges["50-69%"]++;
    else if (pct < 80) attendanceRanges["70-79%"]++;
    else if (pct < 90) attendanceRanges["80-89%"]++;
    else attendanceRanges["90-100%"]++;
  });

  const data = Object.entries(attendanceRanges).map(([range, count]) => ({
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
          Attendance Distribution
        </h3>
        <p style={{ color: "#9ab3b8", margin: "2px 0 0", fontSize: "12px" }}>
          Cohort distribution across attendance brackets.
        </p>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis dataKey="range" stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} />
            <YAxis stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} students`, "Enrolled"]}
              cursor={{ stroke: "#2dd4bf", strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: "#0a1928",
                border: "1px solid #f2bd74",
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
                color: "#f2bd74",
                fontSize: "12px",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f2bd74"
              name="Students"
              strokeWidth={3}
              dot={{ fill: "#f2bd74", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
