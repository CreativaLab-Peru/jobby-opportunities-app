import { z } from "zod";

export const OrganizationSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  logoUrl: z.string().url("URL de logo inválida").optional().or(z.literal("")),
});

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>;
