import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import LoginPage from '@/features/auth/LoginPage';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardPage from '@/features/dashboard/DashboardPage';

// Simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
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
      // Stubs for future pages
      { path: 'projects', element: <div>Projects Page Stub</div> },
      { path: 'education', element: <div>Education Page Stub</div> },
      { path: 'experience', element: <div>Experience Page Stub</div> },
      { path: 'skills', element: <div>Skills Page Stub</div> },
      { path: 'certifications', element: <div>Certifications Page Stub</div> },
      { path: 'messages', element: <div>Messages Page Stub</div> },
      { path: 'settings', element: <div>Settings Page Stub</div> },
    ],
  },
]);
