import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { GeneralIconSelector } from '@/components/ui/general-icon-selector';

const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional().nullable(),
  companyUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  initialValues?: Partial<ExperienceFormValues>;
  onSubmit: (data: ExperienceFormValues) => void;
  isLoading?: boolean;
}

export function ExperienceForm({ initialValues, onSubmit, isLoading }: ExperienceFormProps) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: initialValues?.company || '',
      role: initialValues?.role || '',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      description: initialValues?.description || '',
      icon: initialValues?.icon || null,
      companyUrl: initialValues?.companyUrl || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Google" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyUrl"
            render={({ field }) => (
              <FormItem><FormLabel>Company Website URL (Optional)</FormLabel><FormControl><Input placeholder="https://google.com" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="Senior Developer" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem><FormLabel>End Date (leave blank if present)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem><FormLabel>Responsibilities / Impact</FormLabel><FormControl><RichTextEditor value={field.value || ''} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Icon (e.g. Building)</FormLabel>
              <FormControl>
                <GeneralIconSelector value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Experience'}</Button>
        </div>
      </form>
    </Form>
  );
}
