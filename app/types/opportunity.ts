export interface SalaryRange {
  min?: number;
  max?: number;
}

// Tipo base completo
export interface OpportunityBase {
  type: string;
  title: string;
  organization: string;
  url?: string;
  eligibleLevels: string[];
  eligibleCountries: string[];
  minAge?: number;
  maxAge?: number;
  tags: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  normalizedTags: string[];
  fieldOfStudy?: string;
  modality?: string;
  language?: string;
  fundingAmount?: number;
  currency?: string;
  salaryRange?: SalaryRange;
  deadline?: string;
}

// Para la base de datos (con campos auto-generados)
export interface Opportunity extends OpportunityBase {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  popularityScore?: number;
}

// Para el formulario
export type OpportunityFormData = OpportunityBase;

// Para la lista (solo campos necesarios para mostrar)
export interface OpportunityListItem {
  id: string;
  type: string;
  title: string;
  organization: string;
  url?: string;
  deadline?: string;
  createdAt: string;
}