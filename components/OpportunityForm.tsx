'use client';
import { useState } from 'react'; // Removemos useEffect que no usamos
import { Opportunity, OpportunityFormData  } from '../types/opportunity';

interface OpportunityFormProps {
  opportunity?: Opportunity;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
  onCancel: () => void;
}

// Opciones para los selects
const OPPORTUNITY_TYPES = ['scholarship', 'internship', 'job', 'course', 'competition'];
const LEVELS = ['high_school', 'bachelor', 'master', 'phd', 'postdoc'];
// Removemos las constantes no utilizadas: MODALITIES, COUNTRIES, CURRENCIES

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
    normalizedTags: [],
    ...opportunity
  });

  const [tempSkill, setTempSkill] = useState('');
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

  const addSkill = (field: 'requiredSkills' | 'optionalSkills') => {
    if (tempSkill.trim() && !formData[field].includes(tempSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], tempSkill.trim()]
      }));
      setTempSkill('');
    }
  };

  const removeSkill = (field: 'requiredSkills' | 'optionalSkills', skill: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(s => s !== skill)
    }));
  };

  // Removemos las funciones no utilizadas: addTag y removeTag

  const handleArrayChange = (field: 'eligibleLevels' | 'eligibleCountries', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">
        {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
      </h2>

      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Seleccionar tipo</option>
            {OPPORTUNITY_TYPES.map(type => (
              <option key={type} value={type}>
                {type === 'scholarship' ? 'Beca' :
                 type === 'internship' ? 'Pasantía' :
                 type === 'job' ? 'Trabajo' :
                 type === 'course' ? 'Curso' : 'Competencia'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Organización *</label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Niveles Educativos Elegibles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Niveles Educativos</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LEVELS.map(level => (
            <label key={level} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.eligibleLevels.includes(level)}
                onChange={() => handleArrayChange('eligibleLevels', level)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {level.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Habilidades Requeridas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Habilidades Requeridas</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('requiredSkills'))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: JavaScript, React, Python"
            />
            <button
              type="button"
              onClick={() => addSkill('requiredSkills')}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.requiredSkills.map(skill => (
              <span key={skill} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill('requiredSkills', skill)}
                  className="ml-1 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Habilidades Opcionales</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('optionalSkills'))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: MongoDB, AWS, Docker"
            />
            <button
              type="button"
              onClick={() => addSkill('optionalSkills')}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.optionalSkills.map(skill => (
              <span key={skill} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill('optionalSkills', skill)}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fecha Límite */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha Límite</label>
        <input
          type="datetime-local"
          value={formData.deadline || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
        >
          {loading ? 'Guardando...' : opportunity ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}