import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "@/store";
import RequireAuth from "@/components/RequireAuth";

/* ------------------ Admin module imports ------------------ */
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompaniesManagement from "./pages/admin/CompaniesManagement";
import PostingsManagement from "./pages/admin/PostingsManagement";
import ApplicationsManagement from "./pages/admin/ApplicationsManagement";
import TaxonomiesManagement from "./pages/admin/TaxonomiesManagement";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";

/* ------------------ Student / Public module imports ------------------ */
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentDashboard from "./components/StudentDashboard";
import StudentProfile from "./pages/Profile/StudentProfile";

/* ------------------ Alumni module imports ------------------ */
import { AlumniLayout } from "@/components/layout/AlumniLayout";
import AlumniIndex from "./pages/AlumniIndex";
import PostingsPage from "./pages/PostingsPage";
import PostJobPage from "./pages/PostJobPage";
import AddCompany from "./pages/AddCompany";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import EditCompanyProfilePage from "./pages/EditCompanyProfilePage";
import EditMyProfilePage from "./pages/EditMyProfilePage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import { ApplicantDetails } from "./components/alumni/ApplicantDetails";
import { ExpiredPostings } from "./components/alumni/ExpiredPostings";
import { CompaniesList } from "./components/alumni/CompaniesList";
import { ProfileView } from "./components/alumni/ProfileView";

/* ------------------ Shared ------------------ */
import NotFound from "./pages/NotFound";
/* ---------------------------------------------------------- */

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <TooltipProvider>
          <AppToaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* ---------- Student / Public routes ---------- */}
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* ---------- Auth routes ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* ✅ Added these two new routes */}
            <Route path="/signup/student" element={<SignUp userType="student" />} />
            <Route path="/signup/alumni" element={<SignUp userType="alumni" />} />

            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ---------- Student dashboard & profile ---------- */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />

            {/* ---------- Admin routes (nested) ---------- */}
            <Route
              path="/admin"
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="companies" element={<CompaniesManagement />} />
              <Route path="postings" element={<PostingsManagement />} />
              <Route path="applications" element={<ApplicationsManagement />} />
              <Route path="taxonomies" element={<TaxonomiesManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>

            {/* ---------- Alumni routes (nested) ---------- */}
            <Route
              path="/alumni"
              element={
                <RequireAuth allowedRoles={["alumni", "admin"]}>
                  <AlumniLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AlumniIndex />} />
              <Route path="postings" element={<PostingsPage />} />
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="add-company" element={<AddCompany />} />
              <Route path="company-profile" element={<CompanyProfilePage />} />
              <Route path="edit-company-profile" element={<EditCompanyProfilePage />} />
              <Route path="profile" element={<EditMyProfilePage />} />
              <Route path="applications" element={<JobApplicantsPage />} />
              <Route path="applicant-details" element={<ApplicantDetails />} />
              <Route path="expired-postings" element={<ExpiredPostings />} />
              <Route path="companies" element={<CompaniesList />} />
              <Route path="profile-view" element={<ProfileView />} />
            </Route>

            {/* ---------- Catch-all ---------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </Provider>
    </QueryClientProvider>
  );
}
