import { z } from 'zod';

export const opportunitySchema = z.object({
  type: z.string().min(1, "El tipo es requerido"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  organization: z.string().min(1, "La organización es requerida"),
  organizationLogoUrl: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  eligibleLevels: z.array(z.string()).default([]),
  eligibleCountries: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  area: z.string().min(1, "El área es requerida"),
  requiredSkills: z.array(z.string()).default([]),
  optionalSkills: z.array(z.string()).default([]),
  fieldOfStudy: z.string().optional(),
  modality: z.string().optional(),
  language: z.string().optional(),
  fundingAmount: z.coerce.number().optional(),
  currency: z.string().optional(),
  salaryRange: z.object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
  }).optional(),
  yearSalary: z.coerce.number().optional(),
  deadline: z.date().optional(),
});

export type OpportunityFormValues = z.infer<typeof opportunitySchema>;
