import { createBrowserRouter, Navigate } from 'react-router-dom';
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

// Simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center text-muted-foreground">Loading session...</div>;
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

