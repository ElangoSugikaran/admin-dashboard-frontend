import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { skillsService } from '@/services/api/skillsService';
import { mediaService } from '@/services/api/mediaService';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const projectSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: z.boolean(),
  sortOrder: z.number(),
  
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  
  methodology: z.string().optional(),
  aim: z.string().optional(),
  
  // Use arrays of objects for useFieldArray compatibility, mapped later
  objectives: z.array(z.object({ value: z.string().min(1) })),
  features: z.array(z.object({ value: z.string().min(1) })),
  skillsDemonstrated: z.array(z.object({ value: z.string().min(1) })),
  
  startedAt: z.string().optional().or(z.literal('')),
  completedAt: z.string().optional().or(z.literal('')),
  
  categoryId: z.string().optional().or(z.literal('')),
  
  // Thumbnail can be an existing URL/ID (string) or a new File upload
  thumbnail: z.any().optional(),
  
  // Selected technology IDs
  technologyIds: z.array(z.string())
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialValues, onSubmit, isLoading }: ProjectFormProps) {
  // Fetch available technologies (skills) to select from
  const { data: technologies } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsService.getAll,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: initialValues?.slug || '',
      title: initialValues?.title || '',
      shortDescription: initialValues?.shortDescription || '',
      description: initialValues?.description || '',
      status: initialValues?.status || 'DRAFT',
      featured: initialValues?.featured || false,
      sortOrder: initialValues?.sortOrder || 0,
      githubUrl: initialValues?.githubUrl || '',
      liveUrl: initialValues?.liveUrl || '',
      methodology: initialValues?.methodology || '',
      aim: initialValues?.aim || '',
      objectives: initialValues?.objectives || [],
      features: initialValues?.features || [],
      skillsDemonstrated: initialValues?.skillsDemonstrated || [],
      startedAt: initialValues?.startedAt || '',
      completedAt: initialValues?.completedAt || '',
      categoryId: initialValues?.categoryId || '',
      thumbnail: initialValues?.thumbnail || null,
      technologyIds: initialValues?.technologyIds || [],
    },
  });

  const { fields: objFields, append: appendObj, remove: removeObj } = useFieldArray({
    control: form.control,
    name: "objectives"
  });

  const { fields: featFields, append: appendFeat, remove: removeFeat } = useFieldArray({
    control: form.control,
    name: "features"
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skillsDemonstrated"
  });

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.target instanceof HTMLInputElement && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const selectedTechs = form.watch('technologyIds');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-6 w-full">
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details & Tech Stack</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general" className="space-y-4 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <FormControl>
                    <FileUpload 
                      value={field.value} 
                      onChange={field.onChange} 
                      onUpload={mediaService.uploadFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Awesome Project" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl><Input placeholder="awesome-project" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl><Textarea placeholder="Quick summary for the card..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl><RichTextEditor value={field.value} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t mt-4 space-y-4">
              <h3 className="font-semibold text-base">Project Links</h3>
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repo</FormLabel>
                    <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="liveUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Site</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* DETAILS & TECH */}
          <TabsContent value="details" className="space-y-6 focus-visible:outline-none">
             <div className="border p-4 rounded-lg space-y-4">
                <FormLabel className="text-base font-semibold">Select Technologies Used</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {technologies?.map((tech: any) => {
                    const isSelected = selectedTechs.includes(tech.id);
                    return (
                      <Badge
                        key={tech.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (isSelected) {
                            form.setValue('technologyIds', selectedTechs.filter(id => id !== tech.id));
                          } else {
                            form.setValue('technologyIds', [...selectedTechs, tech.id]);
                          }
                        }}
                      >
                        {tech.name}
                      </Badge>
                    );
                  })}
                  {(!technologies || technologies.length === 0) && (
                    <p className="text-sm text-muted-foreground">No technologies created yet. Please add them in the Skills section.</p>
                  )}
                </div>
             </div>

            <div className="pt-4 border-t mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="methodology" render={({ field }) => (
                  <FormItem><FormLabel>Methodology</FormLabel><FormControl><Input placeholder="e.g. Agile..." {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="aim" render={({ field }) => (
                  <FormItem><FormLabel>Aim</FormLabel><FormControl><Input placeholder="Project goal..." {...field} /></FormControl></FormItem>
                )} />
              </div>

              {/* Arrays */}
              {[{ fields: objFields, append: appendObj, remove: removeObj, name: 'objectives', label: 'Objectives' },
                { fields: featFields, append: appendFeat, remove: removeFeat, name: 'features', label: 'Features' },
                { fields: skillFields, append: appendSkill, remove: removeSkill, name: 'skillsDemonstrated', label: 'Skills Demonstrated' }
              ].map(group => (
                <div key={group.name} className="space-y-3 border p-4 rounded-lg bg-card shadow-sm">
                  <FormLabel className="mb-2 block text-base font-semibold">{group.label}</FormLabel>
                  <div className="space-y-2">
                    {group.fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`${group.name}.${index}.value` as any}
                          render={({ field }) => (
                            <FormItem className="flex-1"><FormControl><Input {...field} /></FormControl></FormItem>
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => group.remove(index)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => group.append({ value: '' })}>
                      <Plus className="mr-2 w-4 h-4" /> Add Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* PUBLISHING */}
          <TabsContent value="publishing" className="space-y-4 focus-visible:outline-none">
            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5"><FormLabel className="text-base">Featured</FormLabel></div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl></FormItem>
              )} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t mt-8">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
