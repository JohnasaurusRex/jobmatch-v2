
import { z, ZodError } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const ResumeUploadSchema = z.object({
  resumeFile: z
    .custom<File>()
    .refine((file: File) => file !== null, 'Resume file is required')
    .refine((file: File) => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine(
      (file: File) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF files are accepted'
    ),
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(5000, 'Job description must be less than 5000 characters'),
});

export class ResumeUploadValidator {
  static validate(data: { resumeFile: File; jobDescription: string }) {
    try {
      ResumeUploadSchema.parse(data);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((err) => err.message).join(', ');
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Validation failed' };
    }
  }
}
