import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api/adminService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  user: { name: string; email: string; avatar: string } | null;
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
  const login = (userData: any) => {
    queryClient.setQueryData(['auth', 'me'], { admin: userData });
  };

  const logoutMutation = useMutation({
    mutationFn: adminService.logout,
    onSettled: () => {
      // Clear auth cache which will trigger re-renders and redirect to login
      queryClient.setQueryData(['auth', 'me'], null);
    }
  });

  const logout = () => {
    logoutMutation.mutate();
  };

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
