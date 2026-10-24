import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { adminService, type AdminProfile } from '@/services/api/adminService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProfile();
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: 'Failed to load profile details' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setProfileMessage(null);
      // 1. Upload to Cloudinary via /media/upload
      const uploadedMedia = await adminService.uploadAvatar(file);
      // 2. Attach media ID to admin profile
      const updated = await adminService.updateProfile({ profileImageId: uploadedMedia.id });
      setProfile(updated);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setProfileMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to upload profile picture';
      setProfileMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);
      setProfileMessage(null);
      const updated = await adminService.updateProfile({ profileImageId: null });
      setProfile(updated);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setProfileMessage({ type: 'success', text: 'Profile picture removed.' });
      toast.success('Profile picture removed.');
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: 'Failed to remove profile picture.' });
      toast.error('Failed to remove profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    try {
      setProfileSaving(true);
      const updated = await adminService.updateProfile({ name, email });
      setProfile(updated);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setProfileMessage({ type: 'success', text: 'Profile information updated successfully!' });
      toast.success('Profile information updated successfully!');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to update profile information.';
      setProfileMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setPasswordSaving(true);
      await adminService.updatePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully! Use this password for your next login.' });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to update password. Check your current password.';
      setPasswordMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avatarUrl = profile?.profileImage?.url;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Profile</h2>
        <p className="text-muted-foreground">Manage your credentials, identity details, and login password.</p>
      </div>

      {profileMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
            profileMessage.type === 'success'
              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {profileMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{profileMessage.text}</span>
        </div>
      )}

      {/* Profile Details & Avatar Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your display name, login email, and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative group shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center text-xl sm:text-2xl font-bold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {avatarUrl ? 'Change Picture' : 'Upload Picture'}
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-destructive hover:text-destructive gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recommended: Square JPG or PNG, max 5MB.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Login Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@portfolio.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                This email address is used to authenticate and sign in to this portal.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
              <Button type="submit" disabled={profileSaving} className="gap-2 font-medium px-5">
                {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your portal access password.</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordMessage && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 text-sm mb-4 ${
                passwordMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {passwordMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
              <Button type="submit" disabled={passwordSaving} className="gap-2 font-medium px-5">
                {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
