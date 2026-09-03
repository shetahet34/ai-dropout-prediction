import { useState } from "react";
import { useAtRiskStudents } from "./hooks/useAtRiskStudents";
import { AnalyticsMetrics } from "./components/AnalyticsMetrics";
import { RiskDistributionChart } from "./components/RiskDistributionChart";
import { AttendanceTrendChart } from "./components/AttendanceTrendChart";
import { PerformanceChart } from "./components/PerformanceChart";
import { SubjectAnalysis } from "./components/SubjectAnalysis";
import { RiskAnalysisPanel } from "./components/RiskAnalysisPanel";
import { InteractiveFilters } from "./components/InteractiveFilters";
import { RiskAnalysisTable } from "./components/RiskAnalysisTable";
import { StudentTable } from "./components/StudentTable";
import { StudentDetailModal } from "./components/StudentDetailModal";
import { MentorAnalysis } from "./components/MentorAnalysis";
import { ClassPerformanceChart } from "./components/ClassPerformanceChart";
import { ClassRiskChart } from "./components/ClassRiskChart";
import { PriorityStudentsPanel } from "./components/PriorityStudentsPanel";
import { MentorStudentsGrouping } from "./components/MentorStudentsGrouping";
import { PerformanceMomentumChart } from "./components/PerformanceMomentumChart";
import { EarlyWarningOperations } from "./components/EarlyWarningOperations";
import { MentorLogin } from "./components/MentorLogin";
import { logout, fetchPolicy } from "./api/students";
import { useEffect } from "react";

function App() {
  const [session, setSession] = useState(() => JSON.parse(sessionStorage.getItem("mentor_session") || "null"));
  const { students, loading, error, refresh: refreshStudents } = useAtRiskStudents(session?.token);
  const [policy, setPolicy] = useState({ attendance: 75, failed_subjects: 1, fee_days: 30 });
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    riskLevel: "all",
    class: "all",
    stream: "all",
    mentor: "all",
    search: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (session?.token) {
      fetchPolicy(session.token)
        .then((p) => {
          if (p) setPolicy(p);
        })
        .catch(() => {});
    }
  }, [session?.token]);

  if (!session) {
    return (
      <MentorLogin
        onLogin={(nextSession) => {
          sessionStorage.setItem("mentor_session", JSON.stringify(nextSession));
          setSession(nextSession);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#07131f" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "28px" }}>📊</span>
          </div>
          <p style={{ fontSize: "14px", color: "#6fe0cb", fontWeight: "600" }}>
            Synchronizing cohort indicators & predictive risk scores...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#07131f", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "440px", background: "#0e2838", padding: "32px", borderRadius: "14px", border: "1px solid #ef4444" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ color: "#fca5a5", fontSize: "18px", margin: "0 0 8px 0" }}>Connection Error</h2>
          <p style={{ fontSize: "13px", color: "#cbdde0", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => {
              sessionStorage.removeItem("mentor_session");
              setSession(null);
            }}
            style={{
              padding: "10px 20px",
              background: "#6fe0cb",
              color: "#082029",
              border: "none",
              borderRadius: "7px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analysis", label: "Risk Diagnostics", icon: "🔍" },
    { id: "students", label: "Student Directory", icon: "👥" },
    { id: "operations", label: "Operations & Ingestion", icon: "⚡" },
  ];

  const filteredStudents = students.filter((student) => {
    const searchValue = filters.search.trim().toLowerCase();
    const riskMatches =
      filters.riskLevel === "all" ||
      (filters.riskLevel === "high" && (student.risk_band === "red" || student.dropout_probability >= 0.7)) ||
      (filters.riskLevel === "medium" && (student.risk_band === "amber" || (student.dropout_probability >= 0.4 && student.dropout_probability < 0.7))) ||
      (filters.riskLevel === "low" && (student.risk_band === "green" || (student.dropout_probability !== null && student.dropout_probability < 0.4)));

    return (
      riskMatches &&
      (filters.class === "all" || student.class_section === filters.class) &&
      (filters.stream === "all" || student.stream === filters.stream) &&
      (filters.mentor === "all" || student.mentor_name === filters.mentor) &&
      (!searchValue ||
        [student.student_name, student.student_id, student.mentor_name, student.class_section, student.stream].some((value) =>
          String(value || "").toLowerCase().includes(searchValue)
        ))
    );
  });

  const sortedStudentsByID = [...filteredStudents].sort((a, b) => {
    const idA = String(a.student_id || "").toLowerCase();
    const idB = String(b.student_id || "").toLowerCase();
    return idA.localeCompare(idB);
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header__inner">
          <div>
            <p className="eyebrow" style={{ marginTop: "6px" }}>Northstar Early Warning System</p>
            <h1>Student Retention & Risk Intelligence</h1>
            <p className="dashboard-header__subtitle">
              Predictive risk analytics, factor explanations, and proactive intervention management.
            </p>
          </div>
          
          <div className="header-actions">
            <button
              className="refresh-button"
              style={{
                background: "rgba(45, 212, 191, 0.12)",
                border: "1px solid rgba(45, 212, 191, 0.35)",
                color: "#2dd4bf",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onClick={async () => {
                await refreshStudents();
              }}
              title="Pull latest database records and recalculated risk scores"
            >
              🔄 Sync Data ({students.length.toLocaleString()})
            </button>
            <span className="live-status">
              <span />
              {session.account.name} · {session.account.role === "principal" ? `${session.account.stream ? `${session.account.stream} ` : "All-School "}Principal` : "Mentor View"}
            </span>
            <button
              className="logout-button"
              onClick={async () => {
                await logout(session.token);
                sessionStorage.removeItem("mentor_session");
                setSession(null);
              }}
            >
              Sign out ↗
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Navigation Tabs */}
        <nav className="dashboard-tabs" aria-label="Dashboard views">
          <span className="dashboard-tabs__label">Workspace Navigation</span>
          <div className="dashboard-tabs__buttons">
            {tabs.map((tab) => (
              <button
                className={`dashboard-tab ${activeTab === tab.id ? "is-active" : ""}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="dashboard-tab__icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="dashboard-view">
            <div className="view-heading">
              <div>
                <p className="eyebrow">Cohort Overview</p>
                <h2>Institutional Academic & Risk Health</h2>
                <p>Real-time risk distribution, performance momentum, and intervention priorities across enrolled students.</p>
              </div>
              <span className="view-heading__meta">
                {students.length.toLocaleString()} Active Students
              </span>
            </div>

            <AnalyticsMetrics students={students} />
            <PriorityStudentsPanel students={students} onSelect={setSelectedStudent} />

            <div className="chart-grid">
              <RiskDistributionChart students={students} />
              <PerformanceChart students={students} />
              <AttendanceTrendChart students={students} />
              <SubjectAnalysis students={students} />
              <MentorAnalysis students={students} />
              <ClassPerformanceChart students={students} />
              <ClassRiskChart students={students} />
              <PerformanceMomentumChart students={students} />
            </div>

            <div className="single-panel-grid" style={{ marginTop: "24px" }}>
              <MentorStudentsGrouping students={students} onSelect={setSelectedStudent} />
            </div>
          </div>
        )}

        {/* 2. Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="dashboard-view">
            <div className="view-heading">
              <div>
                <p className="eyebrow">Diagnostic Signals</p>
                <h2>Deep Signal & Root Cause Breakdown</h2>
                <p>Actionable breakdown of failing subjects, chronic absenteeism alerts, and overdue fees.</p>
              </div>
              <span className="view-heading__meta">Prioritised Matrix</span>
            </div>
            <RiskAnalysisPanel students={students} policy={policy} />
            <RiskAnalysisTable
              students={sortedStudentsByID}
              filters={{ riskLevel: "all", class: "all", stream: "all", mentor: "all" }}
              onSelect={setSelectedStudent}
            />
          </div>
        )}

        {/* 3. Students Directory Tab */}
        {activeTab === "students" && (
          <div className="dashboard-view">
            <div className="view-heading">
              <div>
                <p className="eyebrow">Student Registry</p>
                <h2>Comprehensive Student Directory</h2>
                <p>Filter, search, and drill into individual student 360° academic and intervention profiles.</p>
              </div>
              <span className="view-heading__meta">{filteredStudents.length} Students Listed</span>
            </div>
            <InteractiveFilters students={students} onFilterChange={setFilters} filters={filters} />
            <div className="student-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Registry Results</p>
                  <h3>All Enrolled Students</h3>
                </div>
                <span>{filteredStudents.length} Students</span>
              </div>
              <StudentTable
                students={filteredStudents}
                onSelect={(id) => setSelectedStudent(students.find((student) => student.student_id === id))}
              />
            </div>
          </div>
        )}

        {/* 4. Operations & Policy Tab */}
        {activeTab === "operations" && (
          <div className="dashboard-view">
            <div className="view-heading">
              <div>
                <p className="eyebrow">Operations</p>
                <h2>Data Ingestion & Risk Policies</h2>
                <p>Synchronize institutional registers, calibrate risk thresholds, and dispatch automated alerts.</p>
              </div>
              <span className="view-heading__meta">Operations Hub</span>
            </div>
            <EarlyWarningOperations
              students={students}
              token={session.token}
              onSelect={setSelectedStudent}
              onDataRefresh={async () => {
                await refreshStudents();
                try {
                  const p = await fetchPolicy(session.token);
                  if (p) setPolicy(p);
                } catch (_) {}
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 20px", color: "#64748b", fontSize: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", marginTop: "40px" }}>
        <p>Northstar Academy Early Warning System · ML Inference Engine v2.4</p>
      </footer>

      {/* Student 360 Modal */}
      {selectedStudent && (
        <StudentDetailModal
          key={selectedStudent.student_id}
          student={selectedStudent}
          token={session.token}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

export default App;
