import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Shipments from "./Pages/Shipments.jsx";
import ReportsKpi from "./Pages/ReportsKpi.jsx";
import KpiEntryForm from "./Pages/KpiEntryForm.jsx";
import ValueSpending from "./Pages/ValueSpending.jsx";
import Login from "./Pages/Login.jsx";
import { useIsWiceStaff } from "./lib/useIsWiceStaff.js";

function WiceStaffRoute({ element }) {
  const isWiceStaff = useIsWiceStaff();
  return isWiceStaff ? element : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <UnauthenticatedTemplate>
        <Login />
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/reports-kpi" element={<ReportsKpi />} />
            <Route path="/reports-kpi/entry" element={<KpiEntryForm />} />
            <Route path="/spending" element={<ValueSpending />} />
            <Route path="/kpi-entry" element={<WiceStaffRoute element={<KpiEntryForm />} />} />
            <Route path="*" element={<div className="text-sm text-slate-600">Not found</div>} />
          </Routes>
        </Layout>
      </AuthenticatedTemplate>
    </>
  );
}