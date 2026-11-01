import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './features/auth/AuthContext';
import { Toaster } from 'sonner';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './store/themeStore';
import { toast } from 'sonner';

// Create a query client instance for the app
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (query.queryKey[0] === 'auth') return;
      // Keep infrastructure and internal API details out of dashboard notifications.
      const message = 'We could not load this section. Please try again.';
      // Query failures have one app-wide toast path; mutation feedback stays with each form/action.
      toast.error(message, { id: `query-error-${String(query.queryKey[0] ?? 'unknown')}` });
    },
  }),
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
