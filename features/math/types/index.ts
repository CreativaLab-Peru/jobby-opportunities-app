export interface CVAnalysis {
  text?: string;          // Contenido completo o raw text
  summary?: string;       // Resumen generado
  experience_text?: string;
  skills: string[];
  level?: "Junior" | "Mid" | "Senior" | "Lead"; // Tipado más estricto para seniority
  location?: string;      // País o ciudad base
  countries?: string[];   // Compatibilidad con tu versión anterior
  languages?: string[];
  type?: string;
}

// 2. Preferencias personales del usuario (lo que busca)
export interface UserPreferences {
  modality?: "Remote" | "Hybrid" | "On-site";
  min_salary?: number;
  currency?: string;
  field_of_study?: string;
  top_k?: number;
}

// 3. Filtros operativos para la consulta a la DB
export interface SearchFilters {
  exclude_expired?: boolean;
  only_eligible?: boolean;
}

// 4. El objeto principal que recibe tu Body
export interface MatchRequest {
  cv_data: CVAnalysis;
  preferences?: UserPreferences;
  filters?: SearchFilters;
}
