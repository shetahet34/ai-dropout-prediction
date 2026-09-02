export function TrendIndicator({ value, suffix = "%" }) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Math.abs(num) < 0.05) {
    return (
      <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>
        — 0.0{suffix}
      </span>
    );
  }
  const isDown = num < 0;
  return (
    <span style={{ color: isDown ? "#ef4444" : "#10b981", fontWeight: "600", fontSize: "12px", marginLeft: "4px" }}>
      {isDown ? "▼" : "▲"} {Math.abs(num).toFixed(1)}{suffix}
    </span>
  );
}