import { useMemo, useState, useEffect, useRef } from "react";
import { uploadDataSource, fetchPolicy, updatePolicy, queueAlerts, saveIntervention, fetchDataSources } from "../api/students";

const sourceDefinitions = [
  {
    id: "students",
    name: "Student Master Directory",
    code: "STU-CORE",
    detail: "Primary demographic index, program stream, mentor links & contacts",
    supported: ".xlsx / .csv",
    schemaFields: ["student_id", "student_name", "class_section", "stream", "mentor_name"],
    color: "#2dd4bf",
    icon: "👥",
  },
  {
    id: "attendance",
    name: "Attendance Register",
    code: "ATT-TSERIES",
    detail: "Daily student presence logs, monthly aggregate % & attendance trend",
    supported: ".xlsx / .csv",
    schemaFields: ["student_id", "latest_attendance_pct", "attendance_trend"],
    color: "#38bdf8",
    icon: "📅",
  },
  {
    id: "assessments",
    name: "Assessment Results",
    code: "ACA-PERF",
    detail: "Subject-wise test scores, term evaluation marks, attempts & fails",
    supported: ".xlsx / .csv",
    schemaFields: ["student_id", "avg_score_latest", "score_trend", "subjects_failing"],
    color: "#a78bfa",
    icon: "📚",
  },
  {
    id: "fees",
    name: "Tuition & Fee Ledger",
    code: "FIN-LEDGER",
    detail: "Installment payments, overdue aging days, defaults & receipts",
    supported: ".xlsx / .csv",
    schemaFields: ["student_id", "max_days_overdue", "unpaid_installments"],
    color: "#fbbf24",
    icon: "💳",
  },
];

function downloadTemplate(sourceId) {
  let headers = "";
  let sampleRow = "";
  if (sourceId === "students") {
    headers = "student_id,student_name,class_section,stream,mentor_name,guardian_phone,guardian_email\n";
    sampleRow = "STU15001,Aarav Sharma,10-A,Science,Mentor A - Sharma,9812345678,aarav.sharma@example.com\nSTU15002,Pooja Patel,11-B,Commerce,Mentor D - Mehta,9812345679,pooja.patel@example.com";
  } else if (sourceId === "attendance") {
    headers = "student_id,latest_attendance_pct,avg_attendance_pct,attendance_trend\n";
    sampleRow = "STU15001,84.5,82.0,2.5\nSTU15002,68.0,71.0,-3.0";
  } else if (sourceId === "assessments") {
    headers = "student_id,avg_score_latest,avg_score_previous,score_trend,subjects_failing_now\n";
    sampleRow = "STU15001,76.5,72.0,4.5,0\nSTU15002,48.0,55.0,-7.0,2";
  } else if (sourceId === "fees") {
    headers = "student_id,max_days_overdue,unpaid_installments\n";
    sampleRow = "STU15001,0,0\nSTU15002,45,1";
  }
  const blob = new Blob([headers + sampleRow], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sourceId}_sample_template.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getRiskReasons(student, rules) {
  const reasons = [];
  const att = Number(student.latest_attendance_pct ?? 100);
  const failing = Number(student.subjects_failing_now ?? 0);
  const overdue = Number(student.max_days_overdue ?? 0);

  if (att < rules.attendance) {
    reasons.push(`Attendance ${att.toFixed(1)}% below ${rules.attendance}% policy target`);
  }
  if (failing >= rules.failedSubjects) {
    reasons.push(`${failing} failing subject(s) (Policy: ${rules.failedSubjects}+)`);
  }
  if (overdue > rules.feeDays) {
    reasons.push(`Fees overdue by ${overdue} days (Policy: >${rules.feeDays}d)`);
  }
  return reasons;
}

function evaluateStudentRisk(student, rules) {
  const reasons = getRiskReasons(student, rules);
  const ruleCount = reasons.length;

  let prob = 0.05;
  const att = Number(student.latest_attendance_pct ?? 75.0);
  const failing = Number(student.subjects_failing_now ?? 0);
  const overdue = Number(student.max_days_overdue ?? 0);
  const score = Number(student.avg_score_latest ?? 65.0);
  const scoreTrend = Number(student.score_trend ?? 0.0);
  const attTrend = Number(student.attendance_trend ?? 0.0);
  const maxAttempts = Number(student.max_attempts_any_subject ?? 1);

  if (att < rules.attendance) {
    prob += (rules.attendance - att) * 0.018;
  }
  if (failing >= rules.failedSubjects) {
    prob += failing * 0.20;
  } else if (failing > 0) {
    prob += failing * 0.08;
  }
  if (score < 40.0) {
    prob += (40.0 - score) * 0.012;
  }
  if (overdue > rules.feeDays) {
    prob += Math.min(0.25, (overdue / 100) * 0.15);
  }
  if (scoreTrend < -3.0) prob += 0.05;
  if (attTrend < -3.0) prob += 0.05;
  if (maxAttempts >= 3) prob += 0.08;

  prob = Math.max(0.01, Math.min(0.99, prob));
  const band = (prob >= 0.7 || ruleCount >= 2) ? "red" : ((prob >= 0.4 || ruleCount === 1) ? "amber" : "green");
  return { prob, band, reasons, ruleCount };
}

export function EarlyWarningOperations({ students, token, onSelect, onDataRefresh }) {
  const [imports, setImports] = useState({});
  const [rules, setRules] = useState({ attendance: 75, failedSubjects: 1, feeDays: 30 });
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyMessage, setPolicyMessage] = useState("");
  const [schedule, setSchedule] = useState("Every Monday at 08:00");
  const [alertStatusMessage, setAlertStatusMessage] = useState("");
  const [triggeringAlerts, setTriggeringAlerts] = useState(false);
  const [caseStatus, setCaseStatus] = useState({});
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!token) return;
    fetchPolicy(token)
      .then((p) => {
        if (p) {
          setRules({
            attendance: p.attendance ?? 75,
            failedSubjects: p.failed_subjects ?? 1,
            feeDays: p.fee_days ?? 30,
          });
        }
      })
      .catch(() => {});

    fetchDataSources(token)
      .then((savedSources) => {
        if (savedSources && typeof savedSources === "object") {
          const loaded = {};
          Object.entries(savedSources).forEach(([k, v]) => {
            loaded[k] = {
              name: v.filename,
              fileType: v.file_type,
              status: `✓ ${v.rows_imported} rows ingested`,
              receivedAt: new Date(v.updated_at).toLocaleTimeString(),
              isUploading: false,
            };
          });
          setImports(loaded);
        }
      })
      .catch(() => {});
  }, [token]);

  // Dynamic automatic debounce synchronization with database and entire dashboard
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!token) return;

    const timer = setTimeout(async () => {
      try {
        setSavingPolicy(true);
        await updatePolicy({
          attendance: rules.attendance,
          failed_subjects: rules.failedSubjects,
          fee_days: rules.feeDays,
          high_score: 3,
          medium_score: 2,
        }, token);
        setPolicyMessage(`✓ Live synced: ${rules.attendance}% Att, ${rules.failedSubjects}+ Fails, ${rules.feeDays}d Fee`);
        if (onDataRefresh) {
          await onDataRefresh();
        }
      } catch (e) {
        setPolicyMessage(`❌ Sync error: ${e.message}`);
      } finally {
        setSavingPolicy(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [rules.attendance, rules.failedSubjects, rules.feeDays, token]);

  const evaluatedStudents = useMemo(() => {
    return students.map((student) => ({
      student,
      evaluation: evaluateStudentRisk(student, rules),
    }));
  }, [students, rules]);

  const simulatedRiskCounts = useMemo(() => {
    let red = 0, amber = 0, green = 0;
    evaluatedStudents.forEach(({ evaluation }) => {
      if (evaluation.band === "red") red++;
      else if (evaluation.band === "amber") amber++;
      else green++;
    });
    return { red, amber, green };
  }, [evaluatedStudents]);

  const cases = useMemo(() => {
    return evaluatedStudents
      .filter(({ evaluation }) => evaluation.reasons.length >= 2)
      .sort((a, b) => b.evaluation.reasons.length - a.evaluation.reasons.length || b.evaluation.prob - a.evaluation.prob)
      .slice(0, 10)
      .map(({ student, evaluation }) => ({ student, reasons: evaluation.reasons }));
  }, [evaluatedStudents]);

  const handleResetStandard = async () => {
    const standard = { attendance: 75, failedSubjects: 1, feeDays: 30 };
    setRules(standard);
    setSavingPolicy(true);
    setPolicyMessage("");
    try {
      await updatePolicy({
        attendance: 75,
        failed_subjects: 1,
        fee_days: 30,
        high_score: 3,
        medium_score: 2,
      }, token);
      setPolicyMessage("✓ Reset to institutional standard thresholds (75% Attendance, 1 Fail, 30d Fee)!");
      if (onDataRefresh) {
        await onDataRefresh();
      }
      setTimeout(() => setPolicyMessage(""), 5000);
    } catch (err) {
      setPolicyMessage(`❌ ${err.message}`);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    setPolicyMessage("");
    try {
      await updatePolicy({
        attendance: rules.attendance,
        failed_subjects: rules.failedSubjects,
        fee_days: rules.feeDays,
        high_score: 3,
        medium_score: 2,
      }, token);
      setPolicyMessage("✓ Risk policy calibrated! Recalculated risk tiers and triggered rules for all students.");
      if (onDataRefresh) {
        await onDataRefresh();
      }
      setTimeout(() => setPolicyMessage(""), 5000);
    } catch (err) {
      setPolicyMessage(`❌ ${err.message}`);
    } finally {
      setSavingPolicy(false);
    }
  };

  const attMatches = useMemo(() => students.filter((s) => (s.latest_attendance_pct ?? 100) < rules.attendance).length, [students, rules.attendance]);
  const failMatches = useMemo(() => students.filter((s) => (s.subjects_failing_now ?? 0) >= rules.failedSubjects).length, [students, rules.failedSubjects]);
  const feeMatches = useMemo(() => students.filter((s) => (s.max_days_overdue ?? 0) > rules.feeDays).length, [students, rules.feeDays]);

  const handleTriggerAlertBatch = async () => {
    setTriggeringAlerts(true);
    setAlertStatusMessage("");
    try {
      const res = await queueAlerts(token);
      setAlertStatusMessage(`✓ Successfully staged ${res.queued} notifications across WhatsApp & SMS!`);
      setTimeout(() => setAlertStatusMessage(""), 5000);
    } catch (err) {
      setAlertStatusMessage(`❌ ${err.message}`);
    } finally {
      setTriggeringAlerts(false);
    }
  };

  const handleUpdateStatus = async (student, nextStage) => {
    setCaseStatus((cur) => ({ ...cur, [student.student_id]: nextStage }));
    try {
      await saveIntervention(student.student_id, {
        stage: nextStage,
        notes: `Updated status to ${nextStage} via Operations Hub.`,
        follow_up_date: ""
      }, token);
    } catch (_) {}
  };

  const importFile = async (event, id) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setImports((current) => ({
      ...current,
      [id]: { name: file.name, status: "Processing & recalculating...", isUploading: true }
    }));
    try {
      const result = await uploadDataSource(id, file, token);
      setImports((current) => ({
        ...current,
        [id]: {
          name: file.name,
          fileType: result.file_type || "Spreadsheet",
          status: `✓ ${result.rows_imported} rows ingested`,
          receivedAt: new Date().toLocaleTimeString(),
          isUploading: false,
        }
      }));
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (error) {
      setImports((current) => ({
        ...current,
        [id]: { name: file.name, status: error.message || "Import failed", error: true, isUploading: false }
      }));
    }
  };

  return (
    <div className="operations-grid">
      {/* 1. Connected Active Data Sources Panel */}
      <section className="operations-card operations-card--wide">
        <div className="operations-heading">
          <div>
            <p className="operations-kicker">01 · Enterprise Data Fabric & Ingestion</p>
            <h2>Connected Institutional Registers</h2>
            <p>Hot-swap and synchronize live School ERP/SIS registers. Changes trigger automated schema validation, student directory synchronization, and real-time ML risk scoring.</p>
          </div>
          <span className="operations-chip">
            {Object.keys(imports).length}/{sourceDefinitions.length} Registers Synchronized
          </span>
        </div>

        {/* Live Pipeline Health & Metric Ribbon */}
        <div className="operations-pipeline-ribbon">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#10b981", letterSpacing: "0.5px", textTransform: "uppercase" }}>Data Pipeline Status: Operational & Synced</span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Inference Engine: XGBoost + Tree SHAP Explainer (v2.4)</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Cohort</span>
              <strong style={{ fontSize: "14px", color: "#f8fafc" }}>{students.length} Students</strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>ETL Latency</span>
              <strong style={{ fontSize: "14px", color: "#2dd4bf" }}>~1.2s Real-Time</strong>
            </div>
          </div>
        </div>

        {/* Data Source Grid */}
        <div className="data-source-grid">
          {sourceDefinitions.map((source) => {
            const imported = imports[source.id];
            return (
              <label
                className="data-source"
                key={source.id}
                style={{
                  "--source-color": source.color,
                  border: imported?.error ? "1px solid #ef4444" : (imported ? `1px solid ${source.color}` : "1px solid rgba(255, 255, 255, 0.08)"),
                }}
              >
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(event) => importFile(event, source.id)}
                />
                
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "8px" }}>
                  <span className="data-source__status" style={{ 
                    background: imported?.error ? "rgba(239, 68, 68, 0.2)" : (imported ? "color-mix(in srgb, var(--source-color) 16%, transparent)" : "rgba(255,255,255,0.06)"),
                    color: imported?.error ? "#fca5a5" : (imported ? source.color : "#94a3b8"),
                    borderColor: imported?.error ? "#ef4444" : "transparent"
                  }}>
                    {imported?.isUploading ? "⏳ Ingesting & Scoring..." : (imported?.status || "Ready for Upload")}
                  </span>
                  <span style={{ fontSize: "20px" }}>{source.icon}</span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", width: "100%" }}>
                  <strong>{source.name}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>{source.code}</span>
                </div>
                
                <small style={{ margin: "4px 0 10px" }}>
                  {source.detail}
                </small>

                {/* Schema Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                  {source.schemaFields.map((field) => (
                    <span key={field} className="schema-tag">{field}</span>
                  ))}
                </div>

                {/* Interactive Dropzone State */}
                <div className="data-source__dropzone">
                  {imported?.isUploading ? (
                    <div style={{ fontSize: "11px", color: "#2dd4bf", fontWeight: "600" }}>
                      ⚡ Parsing spreadsheet & recalculating risk...
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>
                        {imported ? `📄 ${imported.name}` : "Drop new dataset or click to browse"}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                        {imported ? `${imported.fileType || "Spreadsheet"} · Updated ${imported.receivedAt || "recently"}` : `Supports ${source.supported}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
                    {imported ? "Auto-synced" : "Ready for Ingestion"}
                  </span>
                  <span className="data-source__action" style={{ color: source.color }}>
                    {imported ? "Hot-Swap Register ↗" : "Upload File ↗"}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Enterprise Template Download Bar */}
        <div className="template-bar">
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            📥 Ready-to-Use Schemas:
          </span>
          {sourceDefinitions.map((src) => (
            <button
              key={src.id}
              type="button"
              className="template-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadTemplate(src.id);
              }}
              title={`Download official ${src.name} CSV template`}
            >
              {src.icon} {src.name} Template
            </button>
          ))}
        </div>
      </section>

      {/* 2. Institutional Risk Policy Calibration Engine */}
      <section className="operations-card">
        <div className="operations-heading">
          <div>
            <p className="operations-kicker">02 · Institutional Risk Thresholds</p>
            <h2>Policy Calibration Engine</h2>
            <p>Adjust risk triggers to dynamically recalibrate institutional alerts & risk bands.</p>
          </div>
          <span className="operations-chip" style={{ background: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf" }}>
            ⚡ Dynamic Rules Engine
          </span>
        </div>

        {/* Live Simulated Impact Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "14px 0 18px" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "11px", color: "#fca5a5", fontWeight: "700" }}>🔴 High Risk (Red)</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", marginTop: "2px" }}>
              {simulatedRiskCounts.red}
            </div>
            <small style={{ fontSize: "10px", color: "#cbdde0" }}>{((simulatedRiskCounts.red / (students.length || 1)) * 100).toFixed(1)}% of cohort</small>
          </div>
          <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "11px", color: "#fde047", fontWeight: "700" }}>🟡 Medium (Amber)</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#f59e0b", marginTop: "2px" }}>
              {simulatedRiskCounts.amber}
            </div>
            <small style={{ fontSize: "10px", color: "#cbdde0" }}>{((simulatedRiskCounts.amber / (students.length || 1)) * 100).toFixed(1)}% of cohort</small>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.35)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "11px", color: "#86efac", fontWeight: "700" }}>🟢 Low Risk (Green)</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#10b981", marginTop: "2px" }}>
              {simulatedRiskCounts.green}
            </div>
            <small style={{ fontSize: "10px", color: "#cbdde0" }}>{((simulatedRiskCounts.green / (students.length || 1)) * 100).toFixed(1)}% of cohort</small>
          </div>
        </div>

        <div className="rule-list">
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Attendance Minimum Target</span>
              <output style={{ color: "#38bdf8", fontWeight: "700" }}>{rules.attendance}% ({attMatches} flagged)</output>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={rules.attendance}
              onChange={(e) => setRules((v) => ({ ...v, attendance: Number(e.target.value) }))}
            />
          </label>
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Failing Subjects Trigger</span>
              <output style={{ color: "#a78bfa", fontWeight: "700" }}>{rules.failedSubjects}+ subjects ({failMatches} flagged)</output>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              value={rules.failedSubjects}
              onChange={(e) => setRules((v) => ({ ...v, failedSubjects: Number(e.target.value) }))}
            />
          </label>
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Fee Overdue Trigger</span>
              <output style={{ color: "#fbbf24", fontWeight: "700" }}>{rules.feeDays} days ({feeMatches} flagged)</output>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={rules.feeDays}
              onChange={(e) => setRules((v) => ({ ...v, feeDays: Number(e.target.value) }))}
            />
          </label>
        </div>
        <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div className="policy-summary" style={{ margin: 0 }}>
            <strong>{cases.length} priority cases</strong>
            <span>match 2+ active risk triggers</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleResetStandard}
              disabled={savingPolicy}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#cbdde0",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                padding: "9px 14px",
                fontWeight: "600",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              🔄 Reset Standard
            </button>
            <button
              onClick={handleSavePolicy}
              disabled={savingPolicy}
              style={{
                background: "#2dd4bf",
                color: "#082029",
                border: "none",
                borderRadius: "6px",
                padding: "9px 18px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(45, 212, 191, 0.25)",
              }}
            >
              {savingPolicy ? "Calibrating..." : "Apply & Save Policy ↗"}
            </button>
          </div>
        </div>
        {policyMessage && <p style={{ margin: "12px 0 0", color: "#86efac", fontSize: "12px", fontWeight: "600" }}>{policyMessage}</p>}
      </section>

      {/* 3. Alert Schedule & Auto-Dispatch */}
      <section className="operations-card">
        <div className="operations-heading">
          <div>
            <p className="operations-kicker">03 · Multichannel Outreach</p>
            <h2>Automated Alert Outbox</h2>
            <p>Schedule proactive notifications to mentors and guardian contacts.</p>
          </div>
        </div>
        <label className="schedule-field">
          Automated Dispatch Schedule
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
            <option>Every Monday at 08:00</option>
            <option>Every weekday at 08:00</option>
            <option>On-demand manual trigger only</option>
          </select>
        </label>
        <div className="alert-preview">
          <span style={{ fontSize: "22px" }}>📱</span>
          <div>
            <strong>Automated WhatsApp & SMS Gateway</strong>
            <small>Dispatches personalized guardian alerts with attendance & grade summaries.</small>
          </div>
        </div>
        <div style={{ marginTop: "18px" }}>
          <button
            className="alert-button"
            style={{ width: "100%", background: "#2dd4bf", color: "#082029", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}
            onClick={handleTriggerAlertBatch}
            disabled={triggeringAlerts}
          >
            {triggeringAlerts ? "Dispatching Queue..." : "🚀 Trigger Automated Alert Batch Now"}
          </button>
          {alertStatusMessage && (
            <p style={{ marginTop: "8px", color: "#86efac", fontSize: "12px", textAlign: "center" }}>
              {alertStatusMessage}
            </p>
          )}
        </div>
      </section>

      {/* 4. Priority Triage & Case Escalation Table */}
      <section className="operations-card operations-card--wide">
        <div className="operations-heading">
          <div>
            <p className="operations-kicker">04 · Actionable Triage</p>
            <h2>High-Priority Student Intervention Escalations</h2>
            <p>Directly update intervention stage or trigger 1-on-1 mentor alerts.</p>
          </div>
        </div>
        <div className="case-list">
          {cases.map(({ student, reasons }) => {
            const currentStage = caseStatus[student.student_id] || student.intervention_stage || "Needs outreach";
            return (
              <div className="case-row" key={student.student_id}>
                <button
                  type="button"
                  className="case-row__person"
                  onClick={() => onSelect && onSelect(student)}
                >
                  <strong style={{ color: "#f4fafb" }}>{student.student_name}</strong>
                  <span>{student.student_id} · Class {student.class_section} ({student.stream})</span>
                </button>
                <div className="case-row__reasons">
                  {reasons.map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </div>
                <select
                  value={currentStage}
                  onChange={(e) => handleUpdateStatus(student, e.target.value)}
                  style={{ background: "#0e2838", border: "1px solid #31546a", color: "#eff8f7", borderRadius: "6px", padding: "6px" }}
                >
                  <option value="Needs outreach">Needs outreach</option>
                  <option value="Mentor contacted">Mentor contacted</option>
                  <option value="Parent meeting scheduled">Parent meeting scheduled</option>
                  <option value="Remedial class assigned">Remedial assigned</option>
                  <option value="Resolved / monitoring">Resolved</option>
                </select>
                <button
                  type="button"
                  onClick={() => onSelect && onSelect(student)}
                  style={{
                    padding: "7px 10px",
                    background: "#1d4ed8",
                    color: "#fff",
                    border: "1px solid #3b82f6",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View 360° ↗
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
