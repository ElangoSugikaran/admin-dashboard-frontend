import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SKILL_CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'FRAMEWORK', label: 'Framework' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'CSS_FRAMEWORK', label: 'CSS Framework' },
  { value: 'DESIGN_TOOL', label: 'Design Tool' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'TOOL', label: 'Tool' },
] as const;

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  FRAMEWORK: 'Framework',
  DATABASE: 'Database',
  CSS_FRAMEWORK: 'CSS Framework',
  DESIGN_TOOL: 'Design Tool',
  SERVICE: 'Service',
  TOOL: 'Tool',
};

export function formatCategoryLabel(category?: string | null): string {
  if (!category) return '';
  if (SKILL_CATEGORY_LABELS[category]) {
    return SKILL_CATEGORY_LABELS[category];
  }
  return category
    .split('_')
    .map((w) => (w.toUpperCase() === 'CSS' ? 'CSS' : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum([
    'FRONTEND', 
    'BACKEND', 
    'FRAMEWORK', 
    'DATABASE', 
    'CSS_FRAMEWORK', 
    'DESIGN_TOOL', 
    'SERVICE', 
    'TOOL'
  ]),
  showInSkills: z.boolean(),
  sortOrder: z.number(),
  icon: z.string().optional().nullable(),
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
      category: initialValues?.category || 'FRONTEND',
      showInSkills: initialValues?.showInSkills || false,
      sortOrder: initialValues?.sortOrder || 0,
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
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={SKILL_CATEGORY_LABELS}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category">
                        {(val: any) => (val ? formatCategoryLabel(val) : 'Select a category')}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SKILL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="showInSkills"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5"><FormLabel className="text-base">Show on Skills Page</FormLabel></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DevIcon (e.g. ReactOriginal)</FormLabel>
              <FormControl>
                <IconSelector value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Skill'}</Button>
        </div>
      </form>
    </Form>
  );
}
