import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';

const certificateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuingBody: z.string().min(1, 'Issuing Body is required'),
  date: z.string().min(1, 'Date is required'),
  associatedModule: z.string().optional(),
  file: z.any().optional(),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

interface CertificateFormProps {
  initialValues?: Partial<CertificateFormValues>;
  onSubmit: (data: CertificateFormValues) => void;
  isLoading?: boolean;
}

export function CertificateForm({ initialValues, onSubmit, isLoading }: CertificateFormProps) {
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: initialValues?.title || '',
      issuingBody: initialValues?.issuingBody || '',
      date: initialValues?.date || '',
      associatedModule: initialValues?.associatedModule || '',
      file: initialValues?.file || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem><FormLabel>Certificate Title</FormLabel><FormControl><Input placeholder="AWS Certified Solutions Architect" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issuingBody"
          render={({ field }) => (
            <FormItem><FormLabel>Issuing Body</FormLabel><FormControl><Input placeholder="Amazon Web Services" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem><FormLabel>Date Issued</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="associatedModule"
            render={({ field }) => (
              <FormItem><FormLabel>Associated Module</FormLabel><FormControl><Input placeholder="Education or Skill Name" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem><FormLabel>Certificate File</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept="image/*,application/pdf" /></FormControl><FormMessage /></FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Certificate'}</Button>
      </form>
    </Form>
  );
}
