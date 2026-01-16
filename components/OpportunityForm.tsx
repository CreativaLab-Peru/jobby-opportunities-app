'use client';
import { useState } from 'react';
import { Opportunity, OpportunityFormData  } from '@/app/types/opportunity';

interface OpportunityFormProps {
  opportunity?: Opportunity;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
  onCancel: () => void;
}

// Opciones para los selects
const OPPORTUNITY_TYPES = [
  { value: 'SCHOLARSHIP', label: 'Beca' },
  { value: 'INTERNSHIP', label: 'Pasantía' },
  { value: 'EXCHANGE_PROGRAM', label: 'Intercambio' },
  { value: 'EMPLOYMENT', label: 'Empleo' },
  { value: 'RESEARCH_FELLOWSHIP', label: 'Investigacion' },
  { value: 'COMPETITION', label: 'Competencia' }
];

const LEVELS = [
  { value: 'INTERN', label: 'Practicante' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Medio' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lider' },
  { value: 'EXECUTIVE', label: 'Ejecutivo' },
  { value: 'MASTER', label: 'Maestria' },
  { value: 'PHD', label: 'Doctorado' },
  { value: 'POSTDOC', label: 'Postdoctorado' }
];

export default function OpportunityForm({ opportunity, onSubmit, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    type: '',
    title: '',
    organization: '',
    url: '',
    eligibleLevels: [],
    eligibleCountries: [],
    tags: [],
    requiredSkills: [],
    optionalSkills: [],
    ...opportunity
  });

  const [tempRequiredSkill, setTempRequiredSkill] = useState('');
  const [tempOptionalSkill, setTempOptionalSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const addRequiredSkill = () => {
    if (tempRequiredSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), tempRequiredSkill.trim()]
      }));
      setTempRequiredSkill('');
    }
  };

  const removeRequiredSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter((_, i) => i !== index)
    }));
  };

  const addOptionalSkill = () => {
    if (tempOptionalSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        optionalSkills: [...(prev.optionalSkills || []), tempOptionalSkill.trim()]
      }));
      setTempOptionalSkill('');
    }
  };

  const removeOptionalSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      optionalSkills: prev.optionalSkills?.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Oportunidad *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona un tipo</option>
              {OPPORTUNITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Beca Fulbright para Maestrías"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organización *
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Universidad de Harvard"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de la Oportunidad
              </label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Elegibilidad */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requisitos de Elegibilidad</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveles Educativos
            </label>
            <div className="space-y-2">
              {LEVELS.map(level => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.eligibleLevels.includes(level.value)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...formData.eligibleLevels, level.value]
                        : formData.eligibleLevels.filter(l => l !== level.value);
                      setFormData(prev => ({ ...prev, eligibleLevels: newLevels }));
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Países Elegibles (separados por comas)
            </label>
            <input
              type="text"
              value={formData.eligibleCountries.join(', ')}
              onChange={(e) => {
                const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                setFormData(prev => ({ ...prev, eligibleCountries: countries }));
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: México, Colombia, Argentina"
            />
          </div>
        </div>
      </div>

      {/* Habilidades y Detalles */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Habilidades y Detalles</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habilidades Requeridas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tempRequiredSkill}
                onChange={(e) => setTempRequiredSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequiredSkill();
                  }
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Escribe una habilidad y presiona Enter"
              />
              <button
                type="button"
                onClick={addRequiredSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills?.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeRequiredSkill(index)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habilidades Opcionales
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tempOptionalSkill}
                onChange={(e) => setTempOptionalSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOptionalSkill();
                  }
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Escribe una habilidad y presiona Enter"
              />
              <button
                type="button"
                onClick={addOptionalSkill}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.optionalSkills?.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeOptionalSkill(index)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo de Estudio
              </label>
              <input
                type="text"
                value={formData.fieldOfStudy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Ingeniería, Ciencias Sociales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad
              </label>
              <select
                value={formData.modality || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, modality: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccionar</option>
                <option value="remote">Remoto</option>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <input
                type="text"
                value={formData.language || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Español, Inglés"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información Financiera */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Financiera</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financiamiento
              </label>
              <input
                type="number"
                value={formData.fundingAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fundingAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Monto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <input
                type="text"
                value={formData.currency || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="USD, MXN, EUR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango Salarial
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.salaryRange?.min || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, min: e.target.value ? parseFloat(e.target.value) : undefined }
                  }))}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={formData.salaryRange?.max || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, max: e.target.value ? parseFloat(e.target.value) : undefined }
                  }))}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Descripción</h3>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Describe los detalles de la oportunidad..."
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !formData.type || !formData.title || !formData.organization}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : opportunity ? 'Actualizar' : 'Crear'} Oportunidad
        </button>
      </div>
    </form>
  );
}
