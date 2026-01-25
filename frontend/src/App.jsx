import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "@/store";
import RequireAuth from "@/components/RequireAuth";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";

/* ------------------ Lazy-loaded Admin pages ------------------ */
const AdminLayout = lazy(() =>
  import("@/components/admin/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminApplicantDetails = lazy(
  () => import("./pages/admin/AdminApplicantDetails"),
);
const CompaniesManagement = lazy(
  () => import("./pages/admin/CompaniesManagement"),
);
const PostingsManagement = lazy(
  () => import("./pages/admin/PostingsManagement"),
);
const ApplicationsOverview = lazy(
  () => import("./pages/admin/ApplicationsOverview"),
);

/* ------------------ Lazy-loaded Student / Public pages ------------------ */
const Index = lazy(() => import("./pages/Index"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const JobsMatchingProfile = lazy(() => import("./pages/JobsMatchingProfile"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const StudentHome = lazy(() => import("@/components/StudentHome"));
const StudentDashboardLayout = lazy(() => import("@/components/StudentDashboardLayout"));
const StudentProfile = lazy(() => import("./pages/Profile/StudentProfile"));
const ApplicationHistory = lazy(() => import("@/components/ApplicationHistory"));

/* ------------------ Lazy-loaded Alumni pages ------------------ */
const AlumniLayout = lazy(() =>
  import("@/components/layout/AlumniLayout").then((m) => ({
    default: m.AlumniLayout,
  })),
);
const AlumniIndex = lazy(() => import("./pages/AlumniIndex"));
const PostingsPage = lazy(() => import("./pages/PostingsPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const AddCompany = lazy(() => import("./pages/AddCompany"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage"));
const EditCompanyProfilePage = lazy(
  () => import("./pages/EditCompanyProfilePage"),
);
const EditMyProfilePage = lazy(() => import("./pages/EditMyProfilePage"));
const JobApplicantsPage = lazy(() => import("./pages/JobApplicantsPage"));
const ApplicantDetails = lazy(() =>
  import("./components/alumni/ApplicantDetails").then((m) => ({
    default: m.ApplicantDetails,
  })),
);
const ExpiredPostings = lazy(() =>
  import("./components/alumni/ExpiredPostings").then((m) => ({
    default: m.ExpiredPostings,
  })),
);
const CompaniesList = lazy(() =>
  import("./components/alumni/CompaniesList").then((m) => ({
    default: m.CompaniesList,
  })),
);
const ProfileView = lazy(() =>
  import("./components/alumni/ProfileView").then((m) => ({
    default: m.ProfileView,
  })),
);
const AlumniJobDetails = lazy(() => import("./pages/AlumniJobDetails"));

/* ------------------ Shared ------------------ */
const NotFound = lazy(() => import("./pages/NotFound"));
const Contributors = lazy(() => import("./pages/Contributors"));
const PublicCompanyProfile = lazy(() => import("./pages/PublicCompanyProfile"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Redirect authenticated users away from public landing/auth routes
const RedirectIfAuthed = ({ children }) => {
  const { isAuthenticated, user } = useSelector(selectAuth);
  if (!isAuthenticated) return children;

  const role = (user?.role || "").toLowerCase();
  const target =
    role === "admin" ? "/admin" : role === "alumni" ? "/alumni" : "/student";

  return <Navigate to={target} replace />;
};
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
            <ChunkErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ---------- Student / Public routes ---------- */}
                  <Route
                    path="/"
                    element={
                      <RedirectIfAuthed>
                        <Index />
                      </RedirectIfAuthed>
                    }
                  />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route
                    path="/company/:id"
                    element={<PublicCompanyProfile />}
                  />
                  <Route
                    path="/jobs/matching"
                    element={
                      <RequireAuth allowedRoles={["student"]}>
                        <JobsMatchingProfile />
                      </RequireAuth>
                    }
                  />
                  <Route path="/contributors" element={<Contributors />} />

                  {/* ---------- Auth routes ---------- */}
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/signup"
                    element={
                      <RedirectIfAuthed>
                        <SignUp />
                      </RedirectIfAuthed>
                    }
                  />

                  {/* ✅ Added these two new routes */}
                  <Route
                    path="/signup/student"
                    element={<SignUp userType="student" />}
                  />
                  <Route
                    path="/signup/alumni"
                    element={<SignUp userType="alumni" />}
                  />

                  <Route
                    path="/reset-password"
                    element={
                      <RedirectIfAuthed>
                        <ResetPassword />
                      </RedirectIfAuthed>
                    }
                  />

                  {/* ---------- Student dashboard & profile ---------- */}
                  <Route path="/dashboard" element={<Navigate to="/student" replace />} />
                  <Route
                    path="/student"
                    element={
                      <RequireAuth allowedRoles={["student"]}>
                        <StudentDashboardLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<StudentHome />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="applications" element={<ApplicationHistory />} />
                  </Route>

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
                    <Route
                      path="applications"
                      element={<ApplicationsOverview />}
                    />
                    <Route
                      path="applicant-details/:applicationId"
                      element={<AdminApplicantDetails />}
                    />
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
                    <Route
                      path="company-profile"
                      element={<CompanyProfilePage />}
                    />
                    <Route
                      path="edit-company-profile"
                      element={<EditCompanyProfilePage />}
                    />
                    <Route path="profile" element={<EditMyProfilePage />} />
                    <Route
                      path="applications"
                      element={<JobApplicantsPage />}
                    />
                    <Route
                      path="applicant-details"
                      element={<ApplicantDetails />}
                    />
                    <Route
                      path="expired-postings"
                      element={<ExpiredPostings />}
                    />
                    <Route path="companies" element={<CompaniesList />} />
                    <Route path="profile-view" element={<ProfileView />} />
                  </Route>

                  {/* ---------- Catch-all ---------- */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ChunkErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </Provider>
    </QueryClientProvider>
  );
}
