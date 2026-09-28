import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.string().min(1, 'Proficiency is required'),
  icon: z.any().optional(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillFormProps {
  initialValues?: Partial<SkillFormValues>;
  onSubmit: (data: SkillFormValues) => void;
  isLoading?: boolean;
}

export function SkillForm({ initialValues, onSubmit, isLoading }: SkillFormProps) {
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initialValues?.name || '',
      category: initialValues?.category || '',
      proficiency: initialValues?.proficiency || 'Intermediate',
      icon: initialValues?.icon || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem><FormLabel>Skill Name</FormLabel><FormControl><Input placeholder="React" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="Frontend" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proficiency"
            render={({ field }) => (
              <FormItem><FormLabel>Proficiency</FormLabel><FormControl><Input placeholder="Advanced" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem><FormLabel>Icon (Optional)</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Skill'}</Button>
      </form>
    </Form>
  );
}
