export function InteractiveFilters({ students, onFilterChange, filters }) {
  const classes = [...new Set(students.map((s) => s.class_section))].sort();
  const streams = [...new Set(students.map((s) => s.stream))].sort();
  const mentors = [...new Set(students.map((s) => s.mentor_name).filter(Boolean))].sort();

  const handleRiskFilter = (e) => {
    onFilterChange({ ...filters, riskLevel: e.target.value });
  };

  const handleClassFilter = (e) => {
    onFilterChange({ ...filters, class: e.target.value });
  };

  const handleStreamFilter = (e) => {
    onFilterChange({ ...filters, stream: e.target.value });
  };

  const handleMentorFilter = (e) => {
    onFilterChange({ ...filters, mentor: e.target.value });
  };

  const handleSearch = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleResetFilters = () => {
    onFilterChange({ riskLevel: "all", class: "all", stream: "all", mentor: "all", search: "" });
  };

  return (
    <div style={{ backgroundColor: "#172033", color: "#e5edf9", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #2e4267", boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)" }}>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 210px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#aabbd7" }}>Search students</label>
          <input value={filters.search || ""} onChange={handleSearch} placeholder="Name, ID, mentor, class..." style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #40577f", backgroundColor: "#0f172a", color: "#e5edf9", fontSize: "14px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Risk Level</label>
          <select
            value={filters.riskLevel}
            onChange={handleRiskFilter}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "14px" }}
          >
            <option value="all">All Risks</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium & High</option>
            <option value="low">All Levels</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Class</label>
          <select
            value={filters.class}
            onChange={handleClassFilter}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "14px" }}
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Mentor</label>
          <select value={filters.mentor} onChange={handleMentorFilter} style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "14px" }}>
            <option value="all">All Mentors</option>
            {mentors.map((mentor) => <option key={mentor} value={mentor}>{mentor}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Stream</label>
          <select
            value={filters.stream}
            onChange={handleStreamFilter}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "14px" }}
          >
            <option value="all">All Streams</option>
            {streams.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleResetFilters}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
