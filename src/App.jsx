import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import DashboardScreen from "./pages/DashboardScreen";
import PatientScreen from "./pages/PatientScreen";
import ReportFormScreen from "./pages/ReportFormScreen";
import ReportDetailScreen from "./pages/ReportDetailScreen";
import CompareScreen from "./pages/CompareScreen";
import SettingsScreen from "./pages/SettingsScreen";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />

          <Route path="/patients/:id" element={<ProtectedRoute><PatientScreen /></ProtectedRoute>} />
          <Route path="/patients/:id/reports/new" element={<ProtectedRoute><ReportFormScreen /></ProtectedRoute>} />
          <Route path="/patients/:id/reports/:reportId" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
          <Route path="/patients/:id/reports/:reportId/edit" element={<ProtectedRoute><ReportFormScreen /></ProtectedRoute>} />
          <Route path="/patients/:id/compare" element={<ProtectedRoute><CompareScreen /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
