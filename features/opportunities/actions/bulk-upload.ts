import { mapCsvRowToOpportunityFormValues } from './csv-mapper';
import { upsertOpportunityAction } from './create-opportunity-action';
import { OpportunityFormValues } from '@/features/opportunities/schemas/opportunity.schema';

export type BulkUploadOptions = {
  createMissingSkills?: boolean;
  createMissingOrgs?: boolean;
  upsertBy?: 'external_id' | 'url' | 'none';
};

export async function processBulkRows(rows: Record<string, string>[], _options: BulkUploadOptions = {}) {
  const results: Array<{ row: number; success: boolean; errors?: string[]; data?: unknown }> = [];
  let created = 0;
  const updated = 0;
  // intentionally reference options to avoid lint unused var; real implementation will use these
  void _options;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNumber = i + 1;
    const mapped = mapCsvRowToOpportunityFormValues(raw);
    if (!mapped.success) {
      results.push({ row: rowNumber, success: false, errors: mapped.errors });
      continue;
    }

    try {
      // Use upsertOpportunityAction to create. We don't pass id so it creates a new one
      const res = await upsertOpportunityAction(mapped.data as OpportunityFormValues);
      if (res.success) {
        created += 1;
        results.push({ row: rowNumber, success: true, data: res.data });
      } else {
        results.push({ row: rowNumber, success: false, errors: [res.error || 'Unknown error'] });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({ row: rowNumber, success: false, errors: [msg] });
    }
  }

  return {
    total: rows.length,
    created,
    updated,
    results,
  };
}

