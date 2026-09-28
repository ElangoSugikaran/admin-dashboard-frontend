import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
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

// 1. Define TagInput locally
function TagInput({ value = [], onChange }: { value: string[], onChange: (v: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
              &times;
            </button>
          </span>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter or comma..."
      />
    </div>
  );
}

const projectSchema = z.object({
  // Basic
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  shortDescription: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  coverImage: z.any().optional(), // File or string URL
  
  // Links
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  demoVideoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),

  // Tech
  techStack: z.array(z.string()).default([]),
  
  // Details
  methodology: z.string().optional(),
  objectives: z.array(z.object({ value: z.string() })).default([]),
  timeline: z.array(z.object({
    phase: z.string(),
    tasks: z.string(),
    start: z.string(),
    end: z.string(),
  })).default([]),
  diagrams: z.array(z.object({ title: z.string(), image: z.any() })).default([]),

  // Gallery
  gallery: z.array(z.object({
    image: z.any(),
    caption: z.string().optional(),
    group: z.string().optional()
  })).default([]),

  // Publishing
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft']).default('draft'),
  order: z.coerce.number().default(0),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialValues, onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title || '',
      category: initialValues?.category || '',
      shortDescription: initialValues?.shortDescription || '',
      description: initialValues?.description || '',
      coverImage: initialValues?.coverImage || null,
      githubUrl: initialValues?.githubUrl || '',
      liveUrl: initialValues?.liveUrl || '',
      demoVideoUrl: initialValues?.demoVideoUrl || '',
      techStack: initialValues?.techStack || [],
      methodology: initialValues?.methodology || '',
      objectives: initialValues?.objectives || [],
      timeline: initialValues?.timeline || [],
      diagrams: initialValues?.diagrams || [],
      gallery: initialValues?.gallery || [],
      featured: initialValues?.featured || false,
      status: initialValues?.status || 'draft',
      order: initialValues?.order || 0,
    },
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "objectives"
  });

  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
    control: form.control,
    name: "timeline"
  });

  const { fields: diagramFields, append: appendDiagram, remove: removeDiagram } = useFieldArray({
    control: form.control,
    name: "diagrams"
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery"
  });

  // To prevent 'Enter' from submitting the form when typing tags
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.target instanceof HTMLInputElement && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-6 w-full">
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
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
                    <FormControl>
                      <Input placeholder="e.g. Next.js Portfolio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Web Development" {...field} />
                    </FormControl>
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
                  <FormControl>
                    <Textarea placeholder="A brief summary for the home page..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="liveUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Site URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="demoVideoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demo Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="YouTube or video link..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Tech Tab */}
          <TabsContent value="tech" className="space-y-4 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormDescription>Press Enter or comma to add tags</FormDescription>
                  <FormControl>
                    <TagInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-4">
              {galleryFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeGallery(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <FormField
                    control={form.control}
                    name={`gallery.${index}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <FileUpload value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`gallery.${index}.caption`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caption</FormLabel>
                          <FormControl>
                            <Input placeholder="Image caption..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`gallery.${index}.group`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Client, Admin..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendGallery({ image: null, caption: '', group: '' })}
              >
                <Plus className="mr-2 w-4 h-4" /> Add Gallery Image
              </Button>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="methodology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Methodology</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Agile, Waterfall..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 border p-4 rounded-lg">
              <FormLabel className="mb-2 block text-base font-semibold">Objectives</FormLabel>
              <div className="space-y-2">
                {objectiveFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`objectives.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Objective..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeObjective(index)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendObjective({ value: '' })}>
                  <Plus className="mr-2 w-4 h-4" /> Add Objective
                </Button>
              </div>
            </div>

            <div className="space-y-3 border p-4 rounded-lg">
              <FormLabel className="mb-2 block text-base font-semibold">Timeline / Gantt Chart</FormLabel>
              <div className="space-y-4">
                {timelineFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg relative gap-4 grid grid-cols-2 bg-muted/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removeTimeline(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`timeline.${index}.phase`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phase Name</FormLabel>
                          <FormControl><Input placeholder="e.g. Planning" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeline.${index}.tasks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tasks</FormLabel>
                          <FormControl><Input placeholder="e.g. Gather requirements" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeline.${index}.start`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeline.${index}.end`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendTimeline({ phase: '', tasks: '', start: '', end: '' })}>
                  <Plus className="mr-2 w-4 h-4" /> Add Timeline Phase
                </Button>
              </div>
            </div>

            <div className="space-y-3 border p-4 rounded-lg">
              <FormLabel className="mb-2 block text-base font-semibold">Design Diagrams</FormLabel>
              <div className="space-y-4">
                {diagramFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeDiagram(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`diagrams.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagram Title</FormLabel>
                          <FormControl><Input placeholder="e.g. System Architecture" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`diagrams.${index}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendDiagram({ title: '', image: null })}>
                  <Plus className="mr-2 w-4 h-4" /> Add Diagram
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Publishing Tab */}
          <TabsContent value="publishing" className="space-y-4 focus-visible:outline-none">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Project</FormLabel>
                    <FormDescription>
                      Show this project prominently on the home page.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormDescription>Used for sorting projects</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
