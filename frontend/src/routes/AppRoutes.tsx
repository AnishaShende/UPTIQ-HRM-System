import { Routes, Route, Navigate } from "react-router-dom";

// Layout Components
import { MainLayout } from "@/components/layout/MainLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

// Dashboard Pages
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";

// Payroll Pages
import { PayrollPage } from "@/pages/payroll/PayrollPage";

// Recruitment Pages
import { RecruitmentPage } from "@/pages/recruitment/RecruitmentPage";

// Leave Management Pages
import { LeaveManagementPage } from "@/pages/leave/LeaveManagementPage";

// Admin Pages
import { AdminPanelPage } from "@/pages/admin/AdminPanelPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Main App Routes */}
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard Routes */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Payroll Routes */}
        <Route path="payroll" element={<PayrollPage />} />

        {/* Recruitment Routes */}
        <Route path="recruitment" element={<RecruitmentPage />} />

        {/* Leave Management Routes */}
        <Route path="leave" element={<LeaveManagementPage />} />

        {/* Admin Routes */}
        <Route path="admin" element={<AdminPanelPage />} />

        {/* Additional Routes */}
        <Route
          path="employees"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Employees Page</h1>
              <p>Coming soon...</p>
            </div>
          }
        />
        <Route
          path="documents"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Documents Page</h1>
              <p>Coming soon...</p>
            </div>
          }
        />
        <Route
          path="reports"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Reports Page</h1>
              <p>Coming soon...</p>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Settings Page</h1>
              <p>Coming soon...</p>
            </div>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
