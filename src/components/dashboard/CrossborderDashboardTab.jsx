import React from "react";
import DashboardInsightsGrid from "./DashboardInsightsGrid.jsx";

export default function CrossborderDashboardTab({ loading, error, onRetry, totals, monthly, donutCards }) {
  return (
    <DashboardInsightsGrid
      kind="crossborder"
      loading={loading}
      error={error}
      onRetry={onRetry}
      totals={totals}
      monthly={monthly}
      donutCards={donutCards}
    />
  );
}
