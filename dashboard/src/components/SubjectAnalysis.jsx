import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SubjectAnalysis({ students }) {
  const subjectFailures = {
    "1 Subject": 0,
    "2 Subjects": 0,
    "3 Subjects": 0,
    "4+ Subjects": 0,
  };
  
  students.forEach((s) => {
    const fails = s.subjects_failing_now || 0;
    if (fails === 1) subjectFailures["1 Subject"]++;
    else if (fails === 2) subjectFailures["2 Subjects"]++;
    else if (fails === 3) subjectFailures["3 Subjects"]++;
    else if (fails >= 4) subjectFailures["4+ Subjects"]++;
  });

  const data = Object.entries(subjectFailures).map(([subjects, count]) => ({
    subjects,
    count,
  }));

  const passingStudents = students.filter((s) => (s.subjects_failing_now || 0) === 0).length;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ color: "#f4fafb", margin: 0, fontSize: "15px", fontWeight: "700" }}>
          Subject Failure Load
        </h3>
        <span style={{ background: "rgba(45, 212, 191, 0.12)", color: "#2dd4bf", padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700" }}>
          {Number(passingStudents).toLocaleString()} Passing All
        </span>
      </div>
      <p style={{ color: "#9ab3b8", margin: 0, fontSize: "12px" }}>
        Distribution of concurrent failing subjects per student.
      </p>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid stroke="#1a3a4e" strokeDasharray="3 3" />
            <XAxis dataKey="subjects" stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} />
            <YAxis stroke="#9ab3b8" tick={{ fontSize: 11, fill: "#cbdde0" }} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} students`, "Count"]}
              cursor={{ fill: "rgba(239, 68, 68, 0.08)" }}
              contentStyle={{
                backgroundColor: "#0a1928",
                border: "1px solid #ef4444",
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
                color: "#fca5a5",
                fontSize: "12px",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            />
            <Bar dataKey="count" fill="#ef4444" name="Students" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
