import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mediaService } from '@/services/api/mediaService';


const certificateSchema = z.object({
  title: z.string().min(1, 'Certificate title is required'),
  issuingBody: z.string().optional(),
  date: z.string().optional(),
  category: z.enum(['ACADEMIC', 'DIGITAL']),
  credentialUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  file: z
    .any()
    .refine(
      (val) => {
        if (!val) return false;
        if (typeof val === 'object' && (val.id || val.url)) return true;
        if (typeof val === 'string' && val.trim().length > 0) return true;
        return false;
      },
      { message: 'Certificate file/image is required' }
    ),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

interface CertificateFormProps {
  initialValues?: Partial<CertificateFormValues> & { issuer?: string; name?: string; image?: any };
  onSubmit: (data: CertificateFormValues) => void;
  isLoading?: boolean;
}

export function CertificateForm({ initialValues, onSubmit, isLoading }: CertificateFormProps) {
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: initialValues?.title || initialValues?.name || '',
      issuingBody: initialValues?.issuingBody || initialValues?.issuer || '',
      date: initialValues?.date || '',
      category: initialValues?.category || 'ACADEMIC',
      credentialUrl: initialValues?.credentialUrl || '',
      file: initialValues?.file || initialValues?.image || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Certificate Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="AWS Certified Solutions Architect" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issuingBody"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Issuing Body <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Amazon Web Services, Coursera" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date Issued <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input type="month" {...field} value={field.value || ''} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic / Primary</SelectItem>
                  <SelectItem value="DIGITAL">Digital / E-Certificate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="credentialUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Credential URL <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="https://verify.example.com/..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Certificate File / Image <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FileUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  onUpload={mediaService.uploadFile} 
                  accept="image/*,application/pdf" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Certificate'}</Button>
        </div>
      </form>
    </Form>
  );
}
