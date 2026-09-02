import { useState } from "react";
import { RiskBadge } from "./RiskBadge";
import { TrendIndicator } from "./TrendIndicator";

export function MentorStudentsGrouping({ students, onSelect }) {
  const [expandedMentor, setExpandedMentor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [displayLimit, setDisplayLimit] = useState(12);

  // Group students by mentor
  const mentorGroups = {};
  students.forEach((s) => {
    const m = s.mentor_name || "Unassigned";
    if (!mentorGroups[m]) {
      mentorGroups[m] = [];
    }
    mentorGroups[m].push(s);
  });

  const sortedMentors = Object.entries(mentorGroups)
    .map(([mentor, mentorStudents]) => {
      // Precise mutually exclusive risk classification
      const highRiskCount = mentorStudents.filter((s) => s.risk_band === "red" || Number(s.dropout_probability || 0) >= 0.7).length;
      const mediumRiskCount = mentorStudents.filter(
        (s) => s.risk_band === "amber" || (Number(s.dropout_probability || 0) >= 0.4 && Number(s.dropout_probability || 0) < 0.7)
      ).length;
      const lowRiskCount = mentorStudents.filter((s) => s.risk_band === "green" || Number(s.dropout_probability || 0) < 0.4).length;
      const totalCount = mentorStudents.length;
      const atRiskCount = highRiskCount + mediumRiskCount;
      const riskRatio = totalCount ? Number(((atRiskCount / totalCount) * 100).toFixed(1)) : 0;

      return {
        mentor,
        students: mentorStudents,
        totalCount,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        atRiskCount,
        riskRatio,
      };
    })
    .sort((a, b) => b.highRiskCount - a.highRiskCount || b.atRiskCount - a.atRiskCount || b.totalCount - a.totalCount);

  const filteredMentors = sortedMentors.filter((group) => {
    const matchesSearch = group.mentor.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "high-risk-only") return group.highRiskCount > 0;
    if (filterType === "heavy-caseload") return group.atRiskCount >= 3;
    return true;
  });

  const visibleMentors = filteredMentors.slice(0, displayLimit);

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(145deg, #0d1a2d, #14243b)",
        border: "1px solid #2563eb",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 14px 28px rgba(0,0,0,.25)",
      }}
    >
      {/* Header & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "18px",
          paddingBottom: "16px",
          borderBottom: "1px solid #1e3a5f",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "17px", color: "#f8fafc", fontWeight: "700" }}>
            👥 Mentor Caseload & Risk Stratification
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8" }}>
            Exact student risk count per faculty mentor (High: ≥70%, Medium: 40–69%, Safe: &lt;40%).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search mentor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "7px 12px",
              background: "#091424",
              border: "1px solid #2d4a6f",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "12px",
              outline: "none",
              minWidth: "160px",
            }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "7px 10px",
              background: "#091424",
              border: "1px solid #2d4a6f",
              borderRadius: "6px",
              color: "#cbd5e1",
              fontSize: "12px",
              outline: "none",
            }}
          >
            <option value="all">All Mentors ({sortedMentors.length})</option>
            <option value="high-risk-only">With High Risk Students</option>
            <option value="heavy-caseload">At-Risk Count ≥ 3</option>
          </select>
        </div>
      </div>

      {/* Mentor Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {!visibleMentors.length && (
          <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No mentors match the selected search or filter criteria.
          </div>
        )}

        {visibleMentors.map((group) => {
          const isExpanded = expandedMentor === group.mentor;
          const highPct = group.totalCount ? ((group.highRiskCount / group.totalCount) * 100).toFixed(0) : 0;
          const medPct = group.totalCount ? ((group.mediumRiskCount / group.totalCount) * 100).toFixed(0) : 0;
          const lowPct = group.totalCount ? ((group.lowRiskCount / group.totalCount) * 100).toFixed(0) : 0;

          return (
            <div
              key={group.mentor}
              style={{
                borderRadius: "10px",
                border: isExpanded ? "1px solid #3b82f6" : "1px solid #1e314b",
                background: "#0a1526",
                overflow: "hidden",
                transition: "border-color 0.2s ease",
              }}
            >
              {/* Mentor Summary Row */}
              <div
                onClick={() => setExpandedMentor(isExpanded ? null : group.mentor)}
                style={{
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isExpanded ? "linear-gradient(90deg, #11223b, #0d1a2d)" : "#0a1526",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {/* Left: Mentor Info & Caseload Number */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "18px",
                    }}
                  >
                    👨‍🏫
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#f8fafc", display: "block" }}>
                      {group.mentor}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Caseload: <strong style={{ color: "#e2e8f0" }}>{group.totalCount} students</strong>
                    </span>
                  </div>
                </div>

                {/* Center: Risk Proportion Mini-Bar */}
                <div style={{ flex: "1 1 200px", maxWidth: "260px", minWidth: "150px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                    <span>At-Risk Ratio</span>
                    <strong style={{ color: group.riskRatio >= 40 ? "#f87171" : group.riskRatio >= 20 ? "#fde047" : "#4ade80" }}>
                      {group.riskRatio}% ({group.atRiskCount}/{group.totalCount})
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "#1e293b", borderRadius: "3px", overflow: "hidden", display: "flex" }}>
                    {group.highRiskCount > 0 && (
                      <div style={{ width: `${highPct}%`, height: "100%", background: "#ef4444" }} title={`High Risk: ${group.highRiskCount}`} />
                    )}
                    {group.mediumRiskCount > 0 && (
                      <div style={{ width: `${medPct}%`, height: "100%", background: "#f59e0b" }} title={`Medium Risk: ${group.mediumRiskCount}`} />
                    )}
                    {group.lowRiskCount > 0 && (
                      <div style={{ width: `${lowPct}%`, height: "100%", background: "#10b981" }} title={`Safe: ${group.lowRiskCount}`} />
                    )}
                  </div>
                </div>

                {/* Right: Exact Count Badges */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  {group.highRiskCount > 0 ? (
                    <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.35)", padding: "4px 9px", borderRadius: "6px", fontWeight: "700", fontSize: "11px", whiteSpace: "nowrap" }}>
                      🚨 {group.highRiskCount} High
                    </span>
                  ) : (
                    <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#86efac", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "11px" }}>
                      0 High
                    </span>
                  )}

                  {group.mediumRiskCount > 0 && (
                    <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fde047", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "4px 9px", borderRadius: "6px", fontWeight: "600", fontSize: "11px", whiteSpace: "nowrap" }}>
                      ⚠️ {group.mediumRiskCount} Medium
                    </span>
                  )}

                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#86efac", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 9px", borderRadius: "6px", fontWeight: "600", fontSize: "11px", whiteSpace: "nowrap" }}>
                    ✓ {group.lowRiskCount} Safe
                  </span>

                  <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: "600", marginLeft: "4px", padding: "4px 8px", background: "#17283c", borderRadius: "4px" }}>
                    {isExpanded ? "Hide ▲" : "View Students ▼"}
                  </span>
                </div>
              </div>

              {/* Expanded Student Table */}
              {isExpanded && (
                <div style={{ background: "#070e1a", borderTop: "1px solid #1e314b", padding: "14px 18px" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1e314b", color: "#94a3b8", textAlign: "left" }}>
                          <th style={{ padding: "10px 12px" }}>Student Name & ID</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Class & Stream</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Risk Level</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Attendance</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Assessment Score</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Failing Subjects</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Fee Overdue</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.students
                          .sort((a, b) => (b.dropout_probability || 0) - (a.dropout_probability || 0))
                          .map((s) => (
                            <tr key={s.student_id} style={{ borderBottom: "1px solid #111f33" }}>
                              <td style={{ padding: "10px 12px" }}>
                                <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{s.student_name}</strong>
                                <div style={{ color: "#64748b", fontSize: "11px" }}>{s.student_id}</div>
                              </td>
                              <td style={{ padding: "10px", textAlign: "center", color: "#cbd5e1" }}>
                                {s.class_section} · {s.stream}
                              </td>
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                <RiskBadge probability={s.dropout_probability} />
                              </td>
                              <td style={{ padding: "10px", textAlign: "center", color: "#f8fafc" }}>
                                {s.latest_attendance_pct != null ? `${s.latest_attendance_pct}%` : "—"} <TrendIndicator value={s.attendance_trend} />
                              </td>
                              <td style={{ padding: "10px", textAlign: "center", color: "#f8fafc" }}>
                                {s.avg_score_latest != null ? s.avg_score_latest.toFixed(1) : "—"} <TrendIndicator value={s.score_trend} />
                              </td>
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                <span style={{ color: s.subjects_failing_now > 0 ? "#f87171" : "#4ade80", fontWeight: "700" }}>
                                  {s.subjects_failing_now > 0 ? `${s.subjects_failing_now} Failing` : "None"}
                                </span>
                              </td>
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                {s.max_days_overdue > 0 ? (
                                  <span style={{ color: "#fbbf24", fontWeight: "600" }}>{s.max_days_overdue}d</span>
                                ) : (
                                  <span style={{ color: "#4ade80" }}>Clear</span>
                                )}
                              </td>
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                <button
                                  onClick={() => onSelect && onSelect(s)}
                                  style={{
                                    background: "#1d4ed8",
                                    color: "#eff6ff",
                                    border: "1px solid #3b82f6",
                                    borderRadius: "6px",
                                    padding: "5px 10px",
                                    fontSize: "11px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  View 360° Profile ↗
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {filteredMentors.length > displayLimit && (
        <div style={{ textAlign: "center", marginTop: "18px" }}>
          <button
            onClick={() => setDisplayLimit((prev) => prev + 16)}
            style={{
              background: "#1e293b",
              border: "1px solid #3b82f6",
              color: "#93c5fd",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Load More Mentors ({visibleMentors.length} of {filteredMentors.length} shown)
          </button>
        </div>
      )}
    </div>
  );
}
