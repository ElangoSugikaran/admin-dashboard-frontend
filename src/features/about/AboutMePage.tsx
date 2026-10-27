import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Share2,
  FileText,
  Sparkles,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileCheck,
  Video,
  Camera,
  Check,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/ui/file-upload';
import { mediaService } from '@/services/api/mediaService';
import { aboutService, type AboutMeData, type ResumeDocument } from '@/services/api/aboutService';

const socialLinkSchema = z.object({
  id: z.string(),
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().default('Globe'),
  active: z.boolean().default(true),
});

const resumeSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Document title is required'),
  fileId: z.string(),
  fileUrl: z.string().url('Must be a valid URL'),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
  isPrimary: z.boolean().default(false),
  uploadedAt: z.string(),
});

const aboutFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  title: z.string().min(1, 'Professional title is required'),
  tagline: z.string().optional(),
  bio: z.string().min(10, 'About me description must be at least 10 characters'),
  location: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  availableForWork: z.boolean().default(true),
  avatar: z.any().nullable().optional(),
  introMedia: z.any().nullable().optional(),
  socialLinks: z.array(socialLinkSchema),
  resumes: z.array(resumeSchema),
});

type AboutFormValues = z.infer<typeof aboutFormSchema>;

export default function AboutMePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bio');

  // New CV upload temporary state
  const [newCvTitle, setNewCvTitle] = useState('');
  const [newCvFile, setNewCvFile] = useState<{ id: string; url: string; fileName?: string } | null>(null);

  // Fetch about info from Fastify API
  const { data: initialData, isLoading: isFetching } = useQuery({
    queryKey: ['aboutMe'],
    queryFn: aboutService.getAboutMe,
  });

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema) as any,
    defaultValues: {
      fullName: '',
      title: '',
      tagline: '',
      bio: '',
      location: '',
      email: '',
      phone: '',
      availableForWork: true,
      avatar: null,
      introMedia: null,
      socialLinks: [],
      resumes: [],
    },
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  // Sync form values whenever initialData changes from backend
  useEffect(() => {
    if (initialData) {
      form.reset({
        fullName: initialData.fullName || '',
        title: initialData.title || '',
        tagline: initialData.tagline || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        availableForWork: initialData.availableForWork ?? true,
        avatar: initialData.avatar || null,
        introMedia: initialData.introMedia || null,
        socialLinks: initialData.socialLinks || [],
        resumes: initialData.resumes || [],
      });
    }
  }, [initialData, form]);

  const updateMutation = useMutation({
    mutationFn: (data: AboutFormValues) => aboutService.updateAboutMe(data as AboutMeData),
    onSuccess: (updated) => {
      queryClient.setQueryData(['aboutMe'], updated);
      queryClient.invalidateQueries({ queryKey: ['aboutMe'] });
      form.reset(form.getValues()); // Mark form as clean after save
      toast.success('About Me details saved successfully to backend!');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update About Me details';
      toast.error(errMsg);
    },
  });

  const onSubmit = (values: AboutFormValues) => {
    updateMutation.mutate(values);
  };

  const onFormError = (errors: any) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    const firstKey = errorKeys[0];
    if (['fullName', 'title', 'tagline', 'bio', 'location', 'availableForWork'].includes(firstKey)) {
      setActiveTab('bio');
    } else if (['email', 'phone', 'socialLinks'].includes(firstKey)) {
      setActiveTab('social');
    } else if (['resumes'].includes(firstKey)) {
      setActiveTab('resume');
    } else if (['avatar', 'introMedia'].includes(firstKey)) {
      setActiveTab('media');
    }
    const errorObj = errors[firstKey];
    const message = errorObj?.message || errorObj?.root?.message || 'Please check the required fields.';
    toast.error(typeof message === 'string' ? message : 'Please check required fields.');
  };

  // Add a newly uploaded CV to the resumes list
  const handleAddNewCv = () => {
    if (!newCvFile || !newCvFile.url) {
      toast.error('Please upload a PDF file first.');
      return;
    }
    const title = newCvTitle.trim() || newCvFile.fileName || 'Curriculum Vitae';
    const currentResumes = form.getValues('resumes') || [];
    const isFirst = currentResumes.length === 0;

    const newDoc: ResumeDocument = {
      id: `cv-${Date.now()}`,
      title,
      fileId: newCvFile.id,
      fileUrl: newCvFile.url,
      fileName: newCvFile.fileName || 'Resume.pdf',
      isPrimary: isFirst,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    const updatedResumes = [...currentResumes, newDoc];
    form.setValue('resumes', updatedResumes, { shouldDirty: true });
    setNewCvTitle('');
    setNewCvFile(null);
    toast.success(`Added "${title}" to your documents. Click Save to persist.`);
  };

  // Set a resume as the active primary one
  const handleSetPrimaryCv = (id: string) => {
    const currentResumes = form.getValues('resumes') || [];
    const updated = currentResumes.map((cv) => ({
      ...cv,
      isPrimary: cv.id === id,
    }));
    form.setValue('resumes', updated, { shouldDirty: true });
    toast.info('Active resume updated. Click Save to apply changes.');
  };

  // Remove a resume
  const handleRemoveCv = (id: string) => {
    const currentResumes = form.getValues('resumes') || [];
    const filtered = currentResumes.filter((cv) => cv.id !== id);
    if (filtered.length > 0 && !filtered.some((cv) => cv.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    form.setValue('resumes', filtered, { shouldDirty: true });
    toast.info('Resume removed. Click Save to apply changes.');
  };

  // Quick preset helper for common social links
  const addSocialPreset = (platform: string, defaultUrl: string, icon: string) => {
    const current = form.getValues('socialLinks') || [];
    if (current.some((s) => s.platform.toLowerCase() === platform.toLowerCase())) {
      toast.warning(`${platform} is already in your social links list.`);
      return;
    }
    appendSocial({
      id: `social-${Date.now()}`,
      platform,
      url: defaultUrl,
      icon,
      active: true,
    });
    toast.success(`Added ${platform} profile`);
  };

  if (isFetching) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">Loading About Me details from backend...</span>
      </div>
    );
  }

  const resumesList = form.watch('resumes') || [];
  const socialList = form.watch('socialLinks') || [];

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">About Me</h1>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-medium text-xs">
            Portfolio Content
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal profile, bio, CV documents, social media links, and media for your public portfolio.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
            {/* Polished Proportional Tab Navigation Bar */}
            <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-xl bg-muted/50 p-1 text-muted-foreground border border-border/70 w-auto gap-1 shadow-2xs">
                <TabsTrigger
                  value="bio"
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs dark:data-active:bg-background dark:data-active:border-transparent dark:data-active:text-foreground"
                >
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Identity & Bio</span>
                </TabsTrigger>

                <TabsTrigger
                  value="social"
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs dark:data-active:bg-background dark:data-active:border-transparent dark:data-active:text-foreground"
                >
                  <Share2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Contact & Social</span>
                  {socialList.length > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/15 px-1 text-[10px] font-mono">
                      {socialList.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="resume"
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs dark:data-active:bg-background dark:data-active:border-transparent dark:data-active:text-foreground"
                >
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                  <span>CV & Resumes</span>
                  {resumesList.length > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/15 px-1 text-[10px] font-mono">
                      {resumesList.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="media"
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs dark:data-active:bg-background dark:data-active:border-transparent dark:data-active:text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Media & Visuals</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: BIO & PROFILE */}
            <TabsContent value="bio" className="space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Personal Identity & Biography</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        These details appear prominently in your portfolio hero, header, and about sections.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Elango Sugikaran" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Professional Title / Role <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Full Stack Developer & Cloud Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            Location / Based In
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Colombo, Sri Lanka (or Remote)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availableForWork"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/80 p-3 bg-muted/20 shadow-2xs">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-primary" />
                              Available for Opportunities
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Displays an "Open for Work" badge on your portfolio.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline / Short Intro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Crafting high-performance web applications and scalable APIs."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Used in hero banner introductions and SEO meta summaries.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          About Me Description <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={8}
                            placeholder="Write your comprehensive story, experience, passions, and background..."
                            className="leading-relaxed font-sans"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Supports multi-paragraph descriptions to showcase your journey and skills.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                {/* Dedicated Per-Tab Save Action (Bottom-Right) */}
                <CardFooter className="flex justify-end pt-4 pb-4 border-t border-border/60 bg-muted/10">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 font-medium shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Profile & Bio'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* TAB 2: CONTACT & SOCIAL LINKS */}
            <TabsContent value="social" className="space-y-6">
              {/* Direct Contact Card */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Direct Contact Channels</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Public contact details displayed for visitors and recruiters.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Email Address <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="e.g. contact@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            Phone / WhatsApp Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. +94 77 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links Card */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Social Media & Online Profiles</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Connect your GitHub, LinkedIn, and external profiles with icon links.
                        </CardDescription>
                      </div>
                    </div>

                    {/* Presets Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSocialPreset('GitHub', 'https://github.com/your-username', 'Github')}
                        className="text-xs gap-1.5 h-8 border-border/80"
                      >
                        <Plus className="h-3 w-3" /> GitHub
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSocialPreset('LinkedIn', 'https://linkedin.com/in/your-profile', 'Linkedin')}
                        className="text-xs gap-1.5 h-8 border-border/80"
                      >
                        <Plus className="h-3 w-3" /> LinkedIn
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSocialPreset('Twitter / X', 'https://x.com/your-handle', 'Twitter')}
                        className="text-xs gap-1.5 h-8 border-border/80"
                      >
                        <Plus className="h-3 w-3" /> Twitter / X
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendSocial({
                            id: `social-${Date.now()}`,
                            platform: 'Portfolio',
                            url: 'https://',
                            icon: 'Globe',
                            active: true,
                          })
                        }
                        className="text-xs gap-1.5 h-8 border-border/80"
                      >
                        <Plus className="h-3 w-3" /> Custom Link
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {socialFields.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-xl bg-muted/20">
                      <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-foreground">No social media links added yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use the 1-click preset buttons above to quickly add your GitHub and LinkedIn profiles.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socialFields.map((fieldItem, index) => (
                        <div
                          key={fieldItem.id}
                          className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-background/50 hover:border-border transition-all shadow-2xs"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                            {/* Platform Name */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name={`socialLinks.${index}.platform`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Platform (e.g. GitHub)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* URL */}
                            <div className="sm:col-span-6">
                              <FormField
                                control={form.control}
                                name={`socialLinks.${index}.url`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Icon Name */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name={`socialLinks.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Icon (Github, Linkedin...)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Actions: Active Switch, Test Link, Remove */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <FormField
                              control={form.control}
                              name={`socialLinks.${index}.active`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-1.5 space-y-0">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      title={field.value ? 'Link is Visible on Portfolio' : 'Link is Hidden'}
                                    />
                                  </FormControl>
                                  <span className="text-[11px] text-muted-foreground w-12">
                                    {field.value ? 'Active' : 'Hidden'}
                                  </span>
                                </FormItem>
                              )}
                            />

                            {form.watch(`socialLinks.${index}.url`) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const url = form.getValues(`socialLinks.${index}.url`);
                                  if (url) window.open(url, '_blank');
                                }}
                                title="Open link in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeSocial(index)}
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* Dedicated Per-Tab Save Action (Bottom-Right) */}
                <CardFooter className="flex justify-end pt-4 pb-4 border-t border-border/60 bg-muted/10">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 font-medium shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Contact & Social'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* TAB 3: RESUME & CV (MULTIPLE PDF SUPPORT) */}
            <TabsContent value="resume" className="space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Curriculum Vitae & Resumes</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Keep multiple PDF versions and designate which one is the active download on your public portfolio.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Managed Resumes List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Available Documents ({resumesList.length})</h3>
                      <span className="text-xs text-muted-foreground">The active document is served to portfolio visitors</span>
                    </div>

                    {resumesList.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-xl bg-muted/20">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium text-foreground">No CV or Resume uploaded yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use the section below to upload your first PDF resume.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {resumesList.map((cv) => (
                          <div
                            key={cv.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
                              cv.isPrimary
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                                : 'border-border/80 hover:border-border bg-background/60'
                            }`}
                          >
                            <div className="flex items-start gap-3.5 overflow-hidden">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                                  cv.isPrimary ? 'bg-primary text-primary-foreground' : 'bg-rose-500/10 text-rose-500'
                                }`}
                              >
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-foreground truncate">{cv.title}</span>
                                  {cv.isPrimary && (
                                    <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 px-1.5 py-0 font-medium">
                                      <CheckCircle2 className="h-3 w-3" /> Active on Portfolio
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {cv.fileName || 'Resume.pdf'} • Added {cv.uploadedAt || 'recently'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              {!cv.isPrimary ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetPrimaryCv(cv.id)}
                                  className="text-xs h-8 gap-1 border-border/80"
                                >
                                  <Check className="h-3 w-3" /> Set as Active
                                </Button>
                              ) : (
                                <span className="text-[11px] text-primary font-medium px-2 py-1 rounded bg-primary/10">
                                  Primary Download
                                </span>
                              )}

                              <a
                                href={cv.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent text-xs h-8 px-2.5 font-medium transition-colors gap-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> View PDF
                              </a>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveCv(cv.id)}
                                title="Delete CV"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload New Resume Section */}
                  <div className="border-t border-border/60 pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-rose-500" />
                      <h3 className="text-sm font-semibold text-foreground">Upload New PDF Resume</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Document Title / Tag</label>
                        <Input
                          placeholder="e.g. Full Stack Developer Resume (2026)"
                          value={newCvTitle}
                          onChange={(e) => setNewCvTitle(e.target.value)}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Friendly label to distinguish this resume format in your dashboard.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Select PDF Document</label>
                        <FileUpload
                          value={newCvFile}
                          onChange={(f) => {
                            if (typeof f === 'string') {
                              setNewCvFile({ id: f, url: f });
                            } else {
                              setNewCvFile(f);
                            }
                          }}
                          onUpload={mediaService.uploadFile}
                          accept="application/pdf"
                          maxSize={15 * 1024 * 1024}
                          label="Drop your PDF resume here or click to browse"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          onClick={handleAddNewCv}
                          disabled={!newCvFile}
                          className="gap-2 font-medium"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                          Add to Resumes List
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Dedicated Per-Tab Save Action (Bottom-Right) */}
                <CardFooter className="flex justify-end pt-4 pb-4 border-t border-border/60 bg-muted/10">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 font-medium shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Resumes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* TAB 4: MEDIA & VISUALS */}
            <TabsContent value="media" className="space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profile Visuals & Media</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Manage your profile picture / avatar and optional introduction video or showcase banner.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Avatar Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Profile Picture / Avatar</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onChange={field.onChange}
                              onUpload={mediaService.uploadFile}
                              accept="image/*"
                              maxSize={5 * 1024 * 1024}
                              label="Upload high-resolution profile picture"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Square JPG or PNG, at least 500x500 pixels. Shown in the About section and hero banner.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Intro Video / Showcase Section */}
                  <div className="border-t border-border/60 pt-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold text-foreground">Intro Video or Featured Showcase Media</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="introMedia"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onChange={field.onChange}
                              onUpload={mediaService.uploadFile}
                              accept="video/*,image/*"
                              maxSize={30 * 1024 * 1024}
                              label="Upload an introduction video (.mp4, .webm) or showcase banner"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Supports MP4/WebM videos up to 30MB, or landscape banner photos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>

                {/* Dedicated Per-Tab Save Action (Bottom-Right) */}
                <CardFooter className="flex justify-end pt-4 pb-4 border-t border-border/60 bg-muted/10">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 font-medium shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Media Assets'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
