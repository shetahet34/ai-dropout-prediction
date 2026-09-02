import { useEffect, useState } from "react";
import { fetchStudentDetail, saveIntervention } from "../api/students";
import { RiskBadge } from "./RiskBadge";
import { TrendIndicator } from "./TrendIndicator";

function getScoreColor(score) {
  if (score >= 80) return "#2dd4bf";
  if (score >= 65) return "#38bdf8";
  if (score >= 50) return "#f2bd74";
  return "#f87171";
}

export function StudentDetailModal({ student, token, onClose }) {
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  
  // Case management state
  const [stage, setStage] = useState("Needs outreach");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingIntervention, setSavingIntervention] = useState(false);
  const [interventionSavedMessage, setInterventionSavedMessage] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);

  // What-if simulator state
  const [simAttendanceDelta, setSimAttendanceDelta] = useState(0);
  const [simScoreDelta, setSimScoreDelta] = useState(0);

  useEffect(() => {
    let active = true;
    fetchStudentDetail(student.student_id, token)
      .then((data) => {
        if (!active) return;
        setDetail(data);
        if (data.current_intervention) {
          setStage(data.current_intervention.stage || "Needs outreach");
          setNotes(data.current_intervention.notes || "");
          setFollowUpDate(data.current_intervention.follow_up_date || "");
        }
      })
      .catch(() => active && setDetailError("Detailed records are unavailable from the server; showing dashboard summary."));
    return () => { active = false; };
  }, [student.student_id, token]);

  const record = { ...student, ...(detail || {}) };
  const scoreColor = getScoreColor(record.avg_score_latest || 0);
  const subjectMarks = record.subject_marks || [];
  const monthlyAttendance = record.monthly_attendance || [];
  const riskReasons = record.risk_reasons || [];
  const recommendedActions = record.recommended_actions || [];
  const interventionHistory = record.intervention_history || [];

  // Calculate What-If Simulation
  const baseProb = record.dropout_probability ?? 0.5;
  const simulatedAttendance = Math.min(100, Math.max(0, (record.latest_attendance_pct || 75) + simAttendanceDelta));
  const simulatedScore = Math.min(100, Math.max(0, (record.avg_score_latest || 65) + simScoreDelta));
  
  const probDelta = -(simAttendanceDelta * 0.018 + simScoreDelta * 0.015);
  const simulatedProb = Math.min(0.99, Math.max(0.01, baseProb + probDelta));
  const simulatedRiskBand = simulatedProb >= 0.7 ? "red" : simulatedProb >= 0.4 ? "amber" : "green";

  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    setSavingIntervention(true);
    setInterventionSavedMessage("");
    try {
      await saveIntervention(record.student_id, {
        stage,
        notes,
        follow_up_date: followUpDate
      }, token);
      setInterventionSavedMessage("✓ Intervention plan saved successfully to database!");
      const updated = await fetchStudentDetail(record.student_id, token);
      setDetail(updated);
      setTimeout(() => setInterventionSavedMessage(""), 4000);
    } catch (err) {
      setInterventionSavedMessage(`❌ Error: ${err.message}`);
    } finally {
      setSavingIntervention(false);
    }
  };

  const parentOutreachText = `Dear Guardian, this is ${record.mentor_name || "Northstar Academy"}. We are reviewing ${record.student_name}'s academic progress. Current Attendance: ${record.latest_attendance_pct || "N/A"}% | Assessment Average: ${(record.avg_score_latest || 0).toFixed(1)}/100. We would like to schedule a brief check-in regarding our student support and academic guidance plan.`;

  const copyParentText = () => {
    navigator.clipboard.writeText(parentOutreachText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(3, 10, 18, 0.88)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <section
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "min(1120px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: "16px",
          color: "#eff8f7",
          background: "linear-gradient(145deg, #0b1d2d, #07131f)",
          border: "1px solid rgba(45, 212, 191, 0.4)",
          boxShadow: "0 28px 80px rgba(0,0,0,.75)",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "flex-start",
            borderBottom: "1px solid #1a3a4e",
            paddingBottom: "22px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  background: "rgba(45, 212, 191, 0.15)",
                  color: "#6fe0cb",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "4px 9px",
                  borderRadius: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "1px solid rgba(45, 212, 191, 0.3)",
                }}
              >
                Student 360° Profile
              </span>
              <span style={{ color: "#7f9ea3", fontSize: "13px" }}>ID: {record.student_id}</span>
            </div>

            <h2 style={{ color: "#f4fafb", margin: "8px 0 4px", fontSize: "28px", letterSpacing: "-0.5px" }}>
              {record.student_name}
            </h2>

            <div style={{ display: "flex", gap: "14px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
              <RiskBadge probability={record.dropout_probability} />
              <span style={{ color: "#2dd4bf", fontSize: "13px", fontWeight: "600" }}>
                Class {record.class_section} · {record.stream} Stream
              </span>
              <span style={{ color: "#456672" }}>•</span>
              <span style={{ color: "#cbdde0", fontSize: "13px" }}>
                Assigned Mentor: <strong style={{ color: "#f4fafb" }}>{record.mentor_name || "Unassigned"}</strong>
              </span>
              <span style={{ color: "#456672" }}>•</span>
              <span style={{ color: "#cbdde0", fontSize: "13px" }}>
                Guardian: <strong>{record.guardian_phone || record.guardian_contact || "—"}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close student profile"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid #31546a",
              borderRadius: "8px",
              color: "#cbdde0",
              fontSize: "20px",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        
        {detailError && <p style={{ marginTop: "16px", color: "#f2bd74", fontSize: "13px" }}>{detailError}</p>}

        {/* Top KPI Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginTop: "24px" }}>
          {/* Average Score Card */}
          <div style={{ background: "#081723", borderRadius: "10px", padding: "16px", border: "1px solid #1a3a4e" }}>
            <small style={{ color: "#7f9ea3", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>
              Assessment Avg
            </small>
            <div style={{ marginTop: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: scoreColor }}>
                {(record.avg_score_latest || 0).toFixed(1)}
              </div>
              <div style={{ fontSize: "11px", color: "#9ab3b8", marginTop: "3px" }}>
                Score Trajectory: <TrendIndicator value={record.score_trend || 0} />
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div style={{ background: "#081723", borderRadius: "10px", padding: "16px", border: "1px solid #1a3a4e" }}>
            <small style={{ color: "#7f9ea3", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>
              Latest Attendance
            </small>
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: (record.latest_attendance_pct || 100) >= 75 ? "#2dd4bf" : (record.latest_attendance_pct || 100) >= 70 ? "#f2bd74" : "#f87171",
                }}
              >
                {record.has_attendance ? `${record.latest_attendance_pct}%` : "—"}
              </div>
              <div style={{ fontSize: "11px", color: "#9ab3b8", marginTop: "3px" }}>
                Attendance Trend: <TrendIndicator value={record.attendance_trend || 0} />
              </div>
            </div>
          </div>

          {/* Failing Subjects Card */}
          <div style={{ background: "#081723", borderRadius: "10px", padding: "16px", border: "1px solid #1a3a4e" }}>
            <small style={{ color: "#7f9ea3", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>
              Failing Subjects
            </small>
            <div style={{ marginTop: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: record.subjects_failing_now > 0 ? "#f87171" : "#2dd4bf" }}>
                {record.subjects_failing_now ?? 0}
              </div>
              <div style={{ fontSize: "11px", color: "#9ab3b8", marginTop: "3px" }}>
                Max Exam Attempts: {record.max_attempts_any_subject || 1}
              </div>
            </div>
          </div>

          {/* Fee Overdue Card */}
          <div style={{ background: "#081723", borderRadius: "10px", padding: "16px", border: "1px solid #1a3a4e" }}>
            <small style={{ color: "#7f9ea3", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>
              Tuition Fee Status
            </small>
            <div style={{ marginTop: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: record.max_days_overdue > 0 ? "#f2bd74" : "#2dd4bf" }}>
                {record.max_days_overdue > 0 ? `${record.max_days_overdue}d Overdue` : "Cleared"}
              </div>
              <div style={{ fontSize: "11px", color: "#9ab3b8", marginTop: "3px" }}>
                {record.unpaid_installments ? `${record.unpaid_installments} Unpaid Installment(s)` : "All Terms Paid"}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Subject Marks & Monthly Attendance Progression */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", marginTop: "24px" }}>
          
          {/* Subject Marks Breakdown */}
          <div style={{ background: "#081723", borderRadius: "12px", border: "1px solid #1a3a4e", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ color: "#f4fafb", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                📚 Subject-by-Subject Examination Marks
              </h3>
              <span style={{ fontSize: "11px", color: "#2dd4bf", fontWeight: "600" }}>{subjectMarks.length} Subjects Enrolled</span>
            </div>

            {!subjectMarks.length && <p style={{ color: "#7f9ea3", fontSize: "13px" }}>No subject marks records found for this student.</p>}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {subjectMarks.map((sub, idx) => {
                const diff = (sub.marks || 0) - (sub.previous || sub.marks || 0);
                const isPassing = sub.result === "Pass" || sub.marks >= 40;
                return (
                  <div key={idx} style={{ background: "#0d2232", borderRadius: "8px", padding: "12px 14px", border: `1px solid ${isPassing ? "#1a3a4e" : "rgba(239, 68, 68, 0.4)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "13px", color: "#f4fafb" }}>{sub.subject}</strong>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: isPassing ? "rgba(45, 212, 191, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isPassing ? "#2dd4bf" : "#fca5a5",
                            fontWeight: "700",
                          }}
                        >
                          {isPassing ? "PASS" : "FAIL"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f9ea3" }}>
                        Prev: <span style={{ color: "#cbdde0" }}>{sub.previous.toFixed(1)}</span> → Current:{" "}
                        <strong style={{ color: getScoreColor(sub.marks) }}>{sub.marks.toFixed(1)}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "6px", background: "#07131f", borderRadius: "3px", overflow: "hidden", position: "relative" }}>
                      <div
                        style={{
                          width: `${Math.min(100, sub.marks)}%`,
                          height: "100%",
                          background: isPassing ? "linear-gradient(90deg, #38bdf8, #2dd4bf)" : "#ef4444",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "#7f9ea3" }}>
                      <span>Attempts: {sub.attempts}</span>
                      <span style={{ color: diff >= 0 ? "#2dd4bf" : "#f87171", fontWeight: "600" }}>
                        {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Attendance Timeline */}
          <div style={{ background: "#081723", borderRadius: "12px", border: "1px solid #1a3a4e", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ color: "#f4fafb", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                📍 Monthly Attendance Progression
              </h3>
              <span style={{ fontSize: "11px", color: "#f2bd74", fontWeight: "600" }}>6-Month Record</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", alignItems: "end", height: "150px", padding: "10px 0 16px" }}>
              {monthlyAttendance.map((item, idx) => {
                const heightPct = Math.max(15, item.pct);
                const color = item.pct >= 75 ? "#2dd4bf" : item.pct >= 70 ? "#f2bd74" : "#ef4444";
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "10px", color: "#f4fafb", fontWeight: "700", marginBottom: "4px" }}>{item.pct.toFixed(0)}%</span>
                    <div style={{ width: "100%", height: `${heightPct}%`, background: `linear-gradient(180deg, ${color}, ${color}55)`, borderRadius: "4px 4px 0 0" }} />
                    <span style={{ fontSize: "11px", color: "#7f9ea3", marginTop: "6px" }}>{item.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Signals & Recommended Action */}
            <div style={{ marginTop: "14px", borderTop: "1px solid #1a3a4e", paddingTop: "12px" }}>
              <strong style={{ fontSize: "12px", color: "#2dd4bf" }}>Identified Risk Factors:</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "12px", color: "#cbdde0", lineHeight: "1.6" }}>
                {riskReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* What-If Simulation Panel */}
        <div
          style={{
            background: "linear-gradient(145deg, #091d2c, #071520)",
            borderRadius: "12px",
            border: "1px solid rgba(45, 212, 191, 0.4)",
            padding: "22px",
            marginTop: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span className="eyebrow">Prescriptive Intelligence</span>
              <h3 style={{ color: "#f4fafb", fontSize: "15px", fontWeight: "700", margin: "2px 0 0" }}>
                🔮 Interactive "What-If" Risk Outcome Simulator
              </h3>
              <p style={{ color: "#9ab3b8", fontSize: "12px", margin: "2px 0 0" }}>
                Simulate targeted recovery goals to project how risk probability and risk tier will improve.
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", color: "#7f9ea3", textTransform: "uppercase", letterSpacing: "0.08em" }}>Projected Risk Outcome:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: simulatedRiskBand === "red" ? "#ef4444" : simulatedRiskBand === "amber" ? "#f2bd74" : "#2dd4bf",
                  }}
                >
                  {(simulatedProb * 100).toFixed(1)}% ({simulatedRiskBand.toUpperCase()})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "14px" }}>
            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#cbdde0", marginBottom: "6px" }}>
                <span>Simulate Attendance Improvement ({simAttendanceDelta >= 0 ? `+${simAttendanceDelta}` : simAttendanceDelta}%)</span>
                <strong style={{ color: "#2dd4bf" }}>Projected: {simulatedAttendance.toFixed(1)}%</strong>
              </label>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={simAttendanceDelta}
                onChange={(e) => setSimAttendanceDelta(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#2dd4bf" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#cbdde0", marginBottom: "6px" }}>
                <span>Simulate Score Recovery ({simScoreDelta >= 0 ? `+${simScoreDelta}` : simScoreDelta} pts)</span>
                <strong style={{ color: "#38bdf8" }}>Projected: {simulatedScore.toFixed(1)} / 100</strong>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={simScoreDelta}
                onChange={(e) => setSimScoreDelta(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>
          </div>
        </div>

        {/* Case Management & Intervention Logging */}
        <div style={{ background: "#081723", borderRadius: "12px", border: "1px solid #1a3a4e", padding: "22px", marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="eyebrow">Case Management Workflow</span>
              <h3 style={{ color: "#f4fafb", fontSize: "15px", fontWeight: "700", margin: "2px 0 0" }}>
                📋 Mentor Action Plan & Intervention Tracking
              </h3>
              <p style={{ color: "#9ab3b8", fontSize: "12px", margin: "2px 0 0" }}>
                Log student meetings, assign remedial sessions, and track follow-up commitments.
              </p>
            </div>
            {interventionSavedMessage && (
              <span style={{ fontSize: "12px", color: "#2dd4bf", fontWeight: "700" }}>{interventionSavedMessage}</span>
            )}
          </div>

          <form onSubmit={handleSaveIntervention} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#cbdde0", marginBottom: "6px", fontWeight: "600" }}>
                Intervention Stage / Status
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "7px",
                  background: "#0e2838",
                  border: "1px solid #31546a",
                  color: "#eff8f7",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="Needs outreach">Needs outreach</option>
                <option value="Mentor contacted">Mentor contacted student</option>
                <option value="Parent meeting scheduled">Parent meeting scheduled</option>
                <option value="Remedial class assigned">Remedial class assigned</option>
                <option value="Counselor referred">Referred to student counselor</option>
                <option value="Fee extension granted">Fee installment extension granted</option>
                <option value="Resolved / monitoring">Resolved / Continuous monitoring</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#cbdde0", marginBottom: "6px", fontWeight: "600" }}>
                Next Review Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "7px",
                  background: "#0e2838",
                  border: "1px solid #31546a",
                  color: "#eff8f7",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#cbdde0", marginBottom: "6px", fontWeight: "600" }}>
                Mentor Intervention Notes & Action Items
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Conducted 1-on-1 review. Enrolled in Physics evening remedial program. Contacted guardian regarding attendance."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "7px",
                  background: "#0e2838",
                  border: "1px solid #31546a",
                  color: "#eff8f7",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="submit"
                disabled={savingIntervention}
                style={{
                  background: "#6fe0cb",
                  color: "#082029",
                  border: "none",
                  borderRadius: "7px",
                  padding: "10px 22px",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {savingIntervention ? "Saving..." : "Save Intervention Plan ↗"}
              </button>
            </div>
          </form>

          {/* Intervention Logs Audit History */}
          {interventionHistory.length > 0 && (
            <div style={{ marginTop: "18px", borderTop: "1px solid #1a3a4e", paddingTop: "14px" }}>
              <h4 style={{ color: "#2dd4bf", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", margin: "0 0 10px", letterSpacing: "0.08em" }}>
                Previous Action Log History
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {interventionHistory.slice(0, 4).map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#0d2232",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      borderLeft: "3px solid #2dd4bf",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#7f9ea3", marginBottom: "3px" }}>
                      <strong style={{ color: "#f4fafb" }}>{log.stage}</strong>
                      <span>Logged by: {log.mentor_name} · {log.created_at}</span>
                    </div>
                    <p style={{ margin: 0, color: "#cbdde0" }}>{log.notes || "No notes logged."}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Guardian Outreach Preview */}
        <div style={{ background: "#081723", borderRadius: "12px", border: "1px solid #1a3a4e", padding: "20px", marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ color: "#f4fafb", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              💬 Guardian Outreach Message Generator
            </h3>
            <button
              onClick={copyParentText}
              style={{
                background: copiedMessage ? "rgba(45, 212, 191, 0.2)" : "rgba(255, 255, 255, 0.08)",
                border: `1px solid ${copiedMessage ? "#2dd4bf" : "#31546a"}`,
                color: copiedMessage ? "#6fe0cb" : "#cbdde0",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              {copiedMessage ? "✓ Copied to Clipboard!" : "Copy WhatsApp/SMS Draft ↗"}
            </button>
          </div>
          <div
            style={{
              background: "#0d2232",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #1a3a4e",
              fontSize: "12px",
              color: "#cbdde0",
              fontStyle: "italic",
              lineHeight: "1.5",
            }}
          >
            "{parentOutreachText}"
          </div>
        </div>

      </section>
    </div>
  );
}
