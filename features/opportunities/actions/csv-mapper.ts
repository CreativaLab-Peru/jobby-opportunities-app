import { OpportunityFormValues, opportunitySchema } from '@/features/opportunities/schemas/opportunity.schema';

function parseList(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value).split(';').map(s => s.trim()).filter(Boolean);
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const v = String(value).toLowerCase();
  return ['1', 'true', 'yes'].includes(v);
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? undefined : d;
}

export function mapCsvRowToOpportunityFormValues(row: Record<string, string>): { success: true; data: OpportunityFormValues } | { success: false; errors: string[] } {
  try {
    const mapped = {
      type: row.type || 'OTHER',
      title: row.title || '',
      organization: row.organization_key || row.organization_name || row.organization || undefined,
      organizationLogoUrl: row.organizationLogoUrl || undefined,
      url: row.url || undefined,
      description: row.description || undefined,
      location: row.location || row.ubication || undefined,
      areas: parseList(row.areas),
      requiredSkills: parseList(row.requiredSkills),
      optionalSkills: parseList(row.optionalSkills),
      eligibleCountries: parseList(row.eligibleCountries).map(c => c.toUpperCase()),
      eligibleLevels: parseList(row.eligibleLevels).map(l => l.toUpperCase()),
      modality: row.modality || undefined,
      language: row.language || undefined,
      yearSalary: parseNumber(row.yearSalary),
      currency: row.currency || undefined,
      salaryRange: {
        min: parseNumber(row.minSalary),
        max: parseNumber(row.maxSalary),
      },
      deadline: parseDate(row.deadline),
      isRecurring: parseBoolean(row.isRecurring),
      tags: parseList(row.tags || ''),
      area: row.area || undefined,
      fieldOfStudy: row.fieldOfStudy || undefined,
    };

    // Validate with Zod schema to ensure types and defaults
    const parsed = opportunitySchema.parse(mapped as unknown);

    return { success: true, data: parsed };
  } catch (err: unknown) {
    // Collect zod errors or generic error message
    const messages: string[] = [];
    if (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as unknown as { errors?: unknown[] }).errors)) {
      const zodErrors = (err as unknown as { errors?: unknown[] }).errors || [];
      type MaybeError = { message?: unknown };
      for (const e of zodErrors) {
        if (e && typeof e === 'object') {
          const maybe = e as MaybeError;
          if (typeof maybe.message === 'string' && maybe.message.length > 0) {
            messages.push(maybe.message);
            continue;
          }
        }
        messages.push(JSON.stringify(e));
      }
    } else if (err instanceof Error) {
      messages.push(err.message);
    } else {
      messages.push(String(err));
    }
    return { success: false, errors: messages };
  }
}

