import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './features/auth/AuthContext';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './store/themeStore';

// Create a query client instance for the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { resolvedTheme } = useTheme();

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors theme={resolvedTheme} />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
