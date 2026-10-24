import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useState } from 'react';
import { adminService } from '@/services/api/adminService';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError, FieldContent } from '@/components/ui/field';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await adminService.login(data);
      const { admin } = response;
      
      login(admin);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 py-8">
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 bg-radial-[at_top] from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Top right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <ThemeToggle variant="dropdown" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-3 ring-4 ring-primary/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to manage projects, skills, education & messages
          </p>
        </div>

        <Card className="w-full border-border/80 shadow-lg bg-card/95 backdrop-blur-xs">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access your administrative workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-medium">Email address</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    {...register('email')}
                    data-invalid={!!errors.email}
                    className="h-10"
                  />
                </FieldContent>
                <FieldError errors={[{ message: errors.email?.message }]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-xs font-medium">Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register('password')}
                      data-invalid={!!errors.password}
                      className="pr-10 h-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FieldContent>
                <FieldError errors={[{ message: errors.password?.message }]} />
              </Field>

              <Button type="submit" className="w-full h-10 mt-2 font-medium gap-2 shadow-xs" disabled={isLoading}>
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Portfolio Content Management System
        </p>
      </div>
    </div>
  );
}
