import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, Calendar, Clock } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const projectMediaSchema = z.object({
  mediaId: z.string(),
  url: z.string().optional(),
  role: z.enum(['SCREENSHOT', 'DIAGRAM', 'DEMO']),
  group: z.string().optional().or(z.literal('')),
  caption: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0)
});

export const projectPhaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Phase name is required'),
  tasks: z.array(z.object({ value: z.string().min(1) })),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0)
});

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
  technologyIds: z.array(z.string()),

  phases: z.array(projectPhaseSchema).optional().default([]),
  projectMedia: z.array(projectMediaSchema).optional().default([])
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  isLoading?: boolean;
}

function PhaseTasksEditor({ control, phaseIndex }: { control: any; phaseIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `phases.${phaseIndex}.tasks`
  });

  return (
    <div className="space-y-2 mt-3 pt-3 border-t">
      <div className="flex items-center justify-between">
        <FormLabel className="text-xs font-semibold text-foreground">Tasks / Work Breakdown</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => append({ value: '' })}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">No tasks added to this phase yet.</p>
      ) : (
        <div className="space-y-1.5">
          {fields.map((taskField, taskIdx) => (
            <div key={taskField.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono w-3 text-center">•</span>
              <FormField
                control={control}
                name={`phases.${phaseIndex}.tasks.${taskIdx}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1 m-0">
                    <FormControl>
                      <Input
                        placeholder="e.g. Requirement Gathering, Database Design..."
                        className="h-8 text-xs"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(taskIdx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectForm({ initialValues, onSubmit, isLoading }: ProjectFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<{ index: number; mediaId?: string } | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  // Fetch available technologies (skills) to select from
  const { data: technologies } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsService.getAll,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
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
      phases: initialValues?.phases || [],
      projectMedia: initialValues?.projectMedia || [],
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

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: "projectMedia"
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control: form.control,
    name: "phases"
  });

  const handleMediaUpload = async (files: File[]) => {
    setIsUploading(true);
    for (const file of files) {
      try {
        const uploaded = await mediaService.uploadFile(file);
        appendMedia({ 
          mediaId: uploaded.id, 
          url: uploaded.url, 
          role: 'SCREENSHOT', 
          group: '', 
          caption: '', 
          sortOrder: form.getValues('projectMedia')?.length || 0 
        });
      } catch (err) {
        console.error("Upload failed for", file.name, err);
      }
    }
    setIsUploading(false);
  };

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
            <TabsTrigger value="media">Media & Files</TabsTrigger>
            <TabsTrigger value="details">Details & Tech Stack</TabsTrigger>
            <TabsTrigger value="timeline">Timeline & Gantt</TabsTrigger>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* MEDIA & FILES */}
          <TabsContent value="media" className="space-y-4 focus-visible:outline-none">
            <div className="border p-4 rounded-lg bg-card shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-4">
                <FormLabel className="text-base font-semibold">Additional Media (Screenshots & Diagrams)</FormLabel>
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isUploading ? 'bg-muted/50 border-muted' : 'border-primary/20 hover:bg-primary/5 cursor-pointer'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isUploading) return;
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
                  if (files.length > 0) handleMediaUpload(files);
                }}
                onClick={() => {
                  if (isUploading) return;
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*,video/*';
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    if (files.length > 0) handleMediaUpload(files);
                  };
                  input.click();
                }}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-muted-foreground">Uploading multiple files to Cloudinary...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-base font-medium mb-1">Click or drag & drop to upload</p>
                    <p className="text-xs text-muted-foreground">Select multiple images or videos at once</p>
                  </div>
                )}
              </div>

              {mediaFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No additional media attached to this project.</p>
              ) : (
                <div className="space-y-4">
                  {mediaFields.map((field: any, index) => (
                    <div key={field.id} className="flex gap-4 items-start border p-3 rounded-md">
                      <input type="hidden" {...form.register(`projectMedia.${index}.mediaId` as const)} />
                      <input type="hidden" {...form.register(`projectMedia.${index}.url` as const)} />
                      <input type="hidden" {...form.register(`projectMedia.${index}.sortOrder` as const)} />
                      
                      <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                         {field.url ? <img src={field.url} alt="Media preview" className="w-full h-full object-cover" /> : 'No Preview'}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`projectMedia.${index}.role` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Role</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "SCREENSHOT"}>
                                <FormControl><SelectTrigger className="h-8"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="SCREENSHOT">Screenshot</SelectItem>
                                  <SelectItem value="DIAGRAM">Diagram</SelectItem>
                                  <SelectItem value="DEMO">Demo Video</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`projectMedia.${index}.caption` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Caption</FormLabel>
                              <FormControl><Input className="h-8" placeholder="e.g. Dashboard View" {...field} value={field.value || ""} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`projectMedia.${index}.group` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Group (Tab Name)</FormLabel>
                              <FormControl><Input className="h-8" placeholder="e.g. Client-side" {...field} value={field.value || ""} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => {
                        setMediaToDelete({ index, mediaId: field.mediaId });
                      }}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                            form.setValue('technologyIds', selectedTechs.filter((id: string) => id !== tech.id));
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* TIMELINE & GANTT */}
          <TabsContent value="timeline" className="space-y-4 focus-visible:outline-none">
            <div className="border p-4 rounded-lg bg-card shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <FormLabel className="text-base font-semibold">Project Schedule & Gantt Phases</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Define work breakdown phases, sub-tasks, and timelines to showcase an engineering Gantt chart.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPhase({
                    name: '',
                    tasks: [{ value: '' }],
                    startDate: '',
                    endDate: '',
                    sortOrder: phaseFields.length
                  })}
                >
                  <Plus className="mr-1.5 w-4 h-4" /> Add Phase
                </Button>
              </div>

              {phaseFields.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-md bg-muted/20">
                  <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No Gantt phases defined for this project.</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Optional: Ideal for university final projects, capstone studies, or milestone-based client deliverables.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPhase({
                      name: '',
                      tasks: [{ value: '' }],
                      startDate: '',
                      endDate: '',
                      sortOrder: 0
                    })}
                  >
                    <Plus className="mr-1.5 w-4 h-4" /> Add First Phase
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phaseFields.map((field, index) => {
                    const sDate = form.watch(`phases.${index}.startDate`);
                    const eDate = form.watch(`phases.${index}.endDate`);
                    let durationDays: number | null = null;
                    if (sDate && eDate) {
                      const d1 = new Date(sDate).getTime();
                      const d2 = new Date(eDate).getTime();
                      if (!isNaN(d1) && !isNaN(d2)) {
                        durationDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
                      }
                    }

                    return (
                      <div key={field.id} className="border p-4 rounded-lg bg-muted/20 space-y-3 relative">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              Phase {index + 1}
                            </Badge>
                            <FormField
                              control={form.control}
                              name={`phases.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1 m-0">
                                  <FormControl>
                                    <Input
                                      placeholder="Phase Name (e.g. Initial Planning, System Design)"
                                      className="font-semibold h-9"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removePhase(index)}
                            title="Delete Phase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name={`phases.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" className="h-8 text-xs" {...field} value={field.value || ''} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`phases.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" className="h-8 text-xs" {...field} value={field.value || ''} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-col justify-end">
                            <FormLabel className="text-xs text-muted-foreground mb-1">Calculated Duration</FormLabel>
                            <div className="h-8 flex items-center px-3 rounded-md border bg-background text-xs font-medium text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
                              {durationDays !== null ? `${durationDays} Days` : 'Set dates'}
                            </div>
                          </div>
                        </div>

                        <PhaseTasksEditor control={form.control} phaseIndex={index} />
                      </div>
                    );
                  })}
                </div>
              )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <AlertDialog open={!!mediaToDelete} onOpenChange={(open) => !open && setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this media? This will remove it from Cloudinary and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingMedia}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingMedia}
              onClick={async (e) => {
                e.preventDefault();
                if (mediaToDelete) {
                  setIsDeletingMedia(true);
                  try {
                    if (mediaToDelete.mediaId) {
                      await mediaService.deleteFile(mediaToDelete.mediaId);
                    }
                    removeMedia(mediaToDelete.index);
                  } catch(err) {
                    console.error("Failed to delete from Cloudinary/DB", err);
                  } finally {
                    setIsDeletingMedia(false);
                    setMediaToDelete(null);
                  }
                }
              }}
            >
              {isDeletingMedia ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
