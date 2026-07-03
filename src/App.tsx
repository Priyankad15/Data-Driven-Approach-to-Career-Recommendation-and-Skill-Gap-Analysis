import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import SkillGapPage from "./pages/SkillGapPage";
import SkillDetailPage from "./pages/SkillDetailPage";
import DailyChallengePage from "./pages/DailyChallengePage";
import MiniProjectsPage from "./pages/MiniProjectsPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import AIMentorPage from "./pages/AIMentorPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import CareerDetailsPage from "./pages/CareerDetailsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingSpinner message="Loading..." />;
  if (!user.isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const OnboardingGuard = () => {
  const { user } = useApp();
  if (user.onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <OnboardingPage />;
};

const AppRoutes = () => {
  const { user, authLoading } = useApp();

  if (authLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <Routes>
      <Route path="/" element={user.isLoggedIn ? <Navigate to={user.onboardingComplete ? "/dashboard" : "/onboarding"} replace /> : <LoginPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingGuard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/skill-gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
      <Route path="/skill-detail/:skill" element={<ProtectedRoute><SkillDetailPage /></ProtectedRoute>} />
      <Route path="/daily-challenges" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
      <Route path="/mini-projects" element={<ProtectedRoute><MiniProjectsPage /></ProtectedRoute>} />
      <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>} />
      <Route path="/ai-mentor" element={<ProtectedRoute><AIMentorPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/career-details" element={<ProtectedRoute><CareerDetailsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
