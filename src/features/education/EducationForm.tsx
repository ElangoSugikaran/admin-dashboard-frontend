import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { GeneralIconSelector } from '@/components/ui/general-icon-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  title: z.string().min(1, 'Degree/Qualification is required'),
  type: z.enum(['DEGREE', 'DIPLOMA', 'CERTIFICATE', 'TRAINING', 'SCHOOL']),
  startDate: z.string().min(1, 'Start date/year is required'),
  endDate: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  description: z.string().optional(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number(),
  showOnHome: z.boolean(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

interface EducationFormProps {
  initialValues?: Partial<EducationFormValues>;
  onSubmit: (data: EducationFormValues) => void;
  isLoading?: boolean;
}

export function EducationForm({ initialValues, onSubmit, isLoading }: EducationFormProps) {
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: initialValues?.institution || '',
      title: initialValues?.title || '',
      type: (initialValues?.type as any) || 'DEGREE',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      grade: initialValues?.grade || '',
      description: initialValues?.description || '',
      icon: initialValues?.icon || null,
      sortOrder: initialValues?.sortOrder ?? 0,
      showOnHome: initialValues?.showOnHome ?? false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. University of Example" {...field} />
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
                <FormLabel>Title (Degree/Certificate)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. B.S. Computer Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEGREE">Degree</SelectItem>
                    <SelectItem value="DIPLOMA">Diploma</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                    <SelectItem value="SCHOOL">School</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade / Result (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. First Class Honours" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date / Year</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g. April 2025 or 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date / Year (leave blank if present)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g. July 2025" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                  />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Sequence number: lower numbers appear first (e.g. 1, 2, 3...)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showOnHome"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3.5 mt-1 sm:mt-0">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">Show on Homepage</FormLabel>
                  <p className="text-[11px] text-muted-foreground">
                    Highlight in homepage Education section
                  </p>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Achievements</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value || ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution Icon</FormLabel>
              <FormControl>
                <GeneralIconSelector value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Education'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
