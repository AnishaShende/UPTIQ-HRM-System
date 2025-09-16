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

// Employee Pages
import { EmployeeListPage } from "@/pages/employees/EmployeeListPage";
import { EmployeeFormPage } from "@/pages/employees/EmployeeFormPage";
import { EmployeeDetailPage } from "@/pages/employees/EmployeeDetailPage";

// Department Pages
import { DepartmentListPage } from "@/pages/departments/DepartmentListPage";
import { DepartmentFormPage } from "@/pages/departments/DepartmentFormPage";

// Position Pages
import { PositionListPage } from "@/pages/positions/PositionListPage";
import { PositionFormPage } from "@/pages/positions/PositionFormPage";

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

        {/* Employee Routes */}
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/new" element={<EmployeeFormPage mode="create" />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage mode="edit" />} />

        {/* Department Routes */}
        <Route path="departments" element={<DepartmentListPage />} />
        <Route path="departments/new" element={<DepartmentFormPage mode="create" />} />
        <Route path="departments/:id/edit" element={<DepartmentFormPage mode="edit" />} />

        {/* Position Routes */}
        <Route path="positions" element={<PositionListPage />} />
        <Route path="positions/new" element={<PositionFormPage mode="create" />} />
        <Route path="positions/:id/edit" element={<PositionFormPage mode="edit" />} />

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
