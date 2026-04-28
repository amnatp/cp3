import React from "react";
import DashboardInsightsGrid from "./DashboardInsightsGrid.jsx";

export default function AirDashboardTab({ loading, error, onRetry, totals, monthly, donutCards }) {
  return (
    <DashboardInsightsGrid
      kind="air"
      loading={loading}
      error={error}
      onRetry={onRetry}
      totals={totals}
      monthly={monthly}
      donutCards={donutCards}
    />
  );
}
