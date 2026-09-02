export function getRiskLevel(probability, riskBand) {
  if (riskBand === "red") {
    return {
      label: "High",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.4)",
      badgeColor: "#fca5a5",
      band: "red",
    };
  }
  if (riskBand === "amber") {
    return {
      label: "Medium",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.4)",
      badgeColor: "#fde047",
      band: "amber",
    };
  }
  if (riskBand === "green") {
    return {
      label: "Low",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.4)",
      badgeColor: "#86efac",
      band: "green",
    };
  }

  const p = Number(probability ?? 0);
  if (probability === null || probability === undefined) {
    return {
      label: "Unavailable",
      color: "#64748b",
      bg: "rgba(100, 116, 139, 0.15)",
      border: "rgba(100, 116, 139, 0.3)",
      badgeColor: "#94a3b8",
      band: "unknown",
    };
  }
  if (p >= 0.7) {
    return {
      label: "High",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.4)",
      badgeColor: "#fca5a5",
      band: "red",
    };
  }
  if (p >= 0.4) {
    return {
      label: "Medium",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.4)",
      badgeColor: "#fde047",
      band: "amber",
    };
  }
  return {
    label: "Low",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.4)",
    badgeColor: "#86efac",
    band: "green",
  };
}
