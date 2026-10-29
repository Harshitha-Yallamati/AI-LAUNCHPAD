import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, and basic punctuation'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be under 255 characters'),
  college: z
    .string()
    .min(2, 'College name must be at least 2 characters')
    .max(200, 'College name must be under 200 characters'),
  branch: z
    .string()
    .min(2, 'Branch must be at least 2 characters')
    .max(100, 'Branch must be under 100 characters'),
  graduationYear: z
    .number()
    .int('Year must be a whole number')
    .min(2024, 'Graduation year must be 2024 or later')
    .max(2030, 'Graduation year must be 2030 or earlier'),
});

export const ambassadorSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  college: z
    .string()
    .min(2, 'College/community must be at least 2 characters')
    .max(200, 'College/community must be under 200 characters'),
  target: z
    .number()
    .int('Target must be a whole number')
    .min(1, 'Target must be at least 1')
    .max(200, 'Target must be 200 or less'),
});

export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  plannedAmount: z.number().min(0, 'Amount must be non-negative'),
  actualAmount: z.number().min(0, 'Amount must be non-negative'),
  status: z.enum(['planned', 'approved', 'spent', 'cancelled']),
});

export const settingsSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required').max(200),
  registrationGoal: z.number().int().min(1).max(100000),
  campaignStartDate: z.string().min(1, 'Start date is required'),
  campaignEndDate: z.string().min(1, 'End date is required'),
  totalBudget: z.number().min(0),
  workshopDate: z.string().min(1, 'Workshop date is required'),
  workshopTime: z.string().min(1, 'Workshop time is required'),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type AmbassadorFormData = z.infer<typeof ambassadorSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
