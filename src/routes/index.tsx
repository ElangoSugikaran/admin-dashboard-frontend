import { createBrowserRouter, Navigate, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import LoginPage from '@/features/auth/LoginPage';
import ProfilePage from '@/features/profile/ProfilePage';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import EducationPage from '@/features/education/EducationPage';
import ExperiencePage from '@/features/experience/ExperiencePage';
import SkillsPage from '@/features/skills/SkillsPage';
import CertificatesPage from '@/features/certificates/CertificatesPage';
import MessagesPage from '@/features/messages/MessagesPage';
import SettingsPage from '@/features/settings/SettingsPage';
import AboutMePage from '@/features/about/AboutMePage';
import { PageError, PageLoading } from '@/components/ui/page-feedback';

function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || 'Page error'}`
    : error instanceof Error ? error.message : 'An unexpected error occurred.';
  return <PageError title="The dashboard hit an unexpected error" message={message} onRetry={() => window.location.reload()} />;
}

// Simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoading label="Checking your session…" />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      { path: 'about', element: <AboutMePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'education', element: <EducationPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'certifications', element: <CertificatesPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

