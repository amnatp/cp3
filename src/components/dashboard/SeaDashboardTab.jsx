import React from "react";
import DashboardInsightsGrid from "./DashboardInsightsGrid.jsx";

export default function SeaDashboardTab({ loading, error, onRetry, totals, monthly, donutCards }) {
  return (
    <DashboardInsightsGrid
      kind="sea"
      loading={loading}
      error={error}
      onRetry={onRetry}
      totals={totals}
      monthly={monthly}
      donutCards={donutCards}
    />
  );
}
