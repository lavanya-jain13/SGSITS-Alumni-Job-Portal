import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "@/store";
import RequireAuth from "@/components/RequireAuth";

/* ------------------ Lazy-loaded Admin pages ------------------ */
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CompaniesManagement = lazy(() => import("./pages/admin/CompaniesManagement"));
const PostingsManagement = lazy(() => import("./pages/admin/PostingsManagement"));
const TaxonomiesManagement = lazy(() => import("./pages/admin/TaxonomiesManagement"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const ApplicationsOverview = lazy(() => import("./pages/admin/ApplicationsOverview"));

/* ------------------ Lazy-loaded Student / Public pages ------------------ */
const Index = lazy(() => import("./pages/Index"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/Profile/StudentProfile"));

/* ------------------ Lazy-loaded Alumni pages ------------------ */
const AlumniLayout = lazy(() => import("@/components/layout/AlumniLayout").then(m => ({ default: m.AlumniLayout })));
const AlumniIndex = lazy(() => import("./pages/AlumniIndex"));
const PostingsPage = lazy(() => import("./pages/PostingsPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const AddCompany = lazy(() => import("./pages/AddCompany"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage"));
const EditCompanyProfilePage = lazy(() => import("./pages/EditCompanyProfilePage"));
const EditMyProfilePage = lazy(() => import("./pages/EditMyProfilePage"));
const JobApplicantsPage = lazy(() => import("./pages/JobApplicantsPage"));
const ApplicantDetails = lazy(() => import("./components/alumni/ApplicantDetails").then(m => ({ default: m.ApplicantDetails })));
const ExpiredPostings = lazy(() => import("./components/alumni/ExpiredPostings").then(m => ({ default: m.ExpiredPostings })));
const CompaniesList = lazy(() => import("./components/alumni/CompaniesList").then(m => ({ default: m.CompaniesList })));
const ProfileView = lazy(() => import("./components/alumni/ProfileView").then(m => ({ default: m.ProfileView })));
const AlumniJobDetails = lazy(() => import("./pages/AlumniJobDetails"));

/* ------------------ Shared ------------------ */
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);
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
          <Suspense fallback={<PageLoader />}>
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
              <Route path="applications" element={<ApplicationsOverview />} />
              <Route path="taxonomies" element={<TaxonomiesManagement />} />
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
              <Route path="job/:id" element={<AlumniJobDetails />} />
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
          </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </Provider>
    </QueryClientProvider>
  );
}
