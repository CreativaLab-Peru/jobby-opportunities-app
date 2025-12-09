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
  description?: string;
  eligibleLevels: string[];
  eligibleCountries: string[];
  tags: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  fieldOfStudy?: string;
  modality?: string;
  language?: string;
  fundingAmount?: number;
  currency?: string;
  salaryRange?: SalaryRange;
  deadline?: string;
}

export interface Opportunity extends OpportunityBase {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  popularityScore?: number;
}

export type OpportunityFormData = OpportunityBase;

export interface OpportunityListItem {
  id: string;
  type: string;
  title: string;
  organization: string;
  url?: string;
  deadline?: string;
  createdAt: string;
}