import { getRiskLevel } from "../utils/riskLevel";

export function RiskBadge({ probability, riskBand }) {
  const risk = getRiskLevel(probability, riskBand);
  const pct = Number(probability ?? 0) * 100;
  return (
    <span
      style={{
        background: risk.bg,
        color: risk.badgeColor,
        border: `1px solid ${risk.border}`,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "8px" }}>
        {risk.band === "red" ? "🔴" : risk.band === "amber" ? "🟡" : "🟢"}
      </span>
      {risk.label} · {pct.toFixed(0)}%
    </span>
  );
}
