import * as z from "zod";

export const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  logoUrl: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
