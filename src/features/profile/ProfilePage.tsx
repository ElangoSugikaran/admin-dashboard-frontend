import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { adminService } from '@/services/api/adminService';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError, FieldContent } from '@/components/ui/field';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"]
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: adminService.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      if (data?.admin) {
        login(data.admin);
      }
      reset({
        name: data?.admin?.name || user?.name || '',
        email: data?.admin?.email || user?.email || '',
        currentPassword: '',
        newPassword: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Manage your personal information and security credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input id="name" {...register('name')} data-invalid={!!errors.name} />
              </FieldContent>
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input id="email" type="email" {...register('email')} data-invalid={!!errors.email} />
              </FieldContent>
              <FieldError errors={[{ message: errors.email?.message }]} />
            </Field>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <Field className="mb-4">
                <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                <FieldContent>
                  <Input id="currentPassword" type="password" placeholder="Leave blank to keep current" {...register('currentPassword')} data-invalid={!!errors.currentPassword} />
                </FieldContent>
                <FieldError errors={[{ message: errors.currentPassword?.message }]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <FieldContent>
                  <Input id="newPassword" type="password" placeholder="Leave blank to keep current" {...register('newPassword')} data-invalid={!!errors.newPassword} />
                </FieldContent>
                <FieldError errors={[{ message: errors.newPassword?.message }]} />
              </Field>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
