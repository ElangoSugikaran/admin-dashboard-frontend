import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="FRONTEND">Frontend</SelectItem>
                    <SelectItem value="BACKEND">Backend</SelectItem>
                    <SelectItem value="FRAMEWORK">Framework</SelectItem>
                    <SelectItem value="DATABASE">Database</SelectItem>
                    <SelectItem value="CSS_FRAMEWORK">CSS Framework</SelectItem>
                    <SelectItem value="DESIGN_TOOL">Design Tool</SelectItem>
                    <SelectItem value="SERVICE">Service (e.g. AWS)</SelectItem>
                    <SelectItem value="TOOL">Tool (e.g. Git)</SelectItem>
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
