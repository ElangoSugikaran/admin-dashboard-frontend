import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminProfile } from '@/services/api/adminService';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: AdminProfile) => void;
  logout: () => void;
  user: (AdminProfile & { avatar?: string }) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch session state from backend directly
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: adminService.getMe,
    retry: false, // Don't retry on 401 Unauthorized
  });

  const isAuthenticated = !!data?.admin;
  const user = data?.admin || null;

  // Optimistically set the user in cache upon manual login
  const login = (userData: AdminProfile) => {
    queryClient.setQueryData(['auth', 'me'], { admin: userData });
  };

  const logout = useCallback(() => {
    // Drop private data and redirect immediately; the server must expire the HttpOnly cookie.
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' });
    queryClient.setQueryData(['auth', 'me'], null);
    void adminService.logout().catch(() => {
      toast.error('Signed out locally, but the server could not confirm session revocation.');
    });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
