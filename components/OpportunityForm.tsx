'use client';
import { useState } from 'react'; // Removemos useEffect que no usamos
import { Opportunity, OpportunityFormData  } from '../app/types/opportunity';
interface OpportunityFormProps {
  opportunity?: Opportunity;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
  onCancel: () => void;
}

// Opciones para los selects
const OPPORTUNITY_TYPES = ['scholarship', 'internship', 'job', 'course', 'competition'];
const LEVELS = ['high_school', 'bachelor', 'master', 'phd', 'postdoc'];

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
    if (tempRequiredSkill.trim() && !formData.requiredSkills.includes(tempRequiredSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, tempRequiredSkill.trim()]
      }));
      setTempRequiredSkill('');
    }
  };

  const addOptionalSkill = () => {
    if (tempOptionalSkill.trim() && !formData.optionalSkills.includes(tempOptionalSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        optionalSkills: [...prev.optionalSkills, tempOptionalSkill.trim()]
      }));
      setTempOptionalSkill('');
    }
  };

  const removeSkill = (field: 'requiredSkills' | 'optionalSkills', skill: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(s => s !== skill)
    }));
  };

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
              value={tempRequiredSkill}
              onChange={(e) => setTempRequiredSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: JavaScript, React, Python"
            />
            <button
              type="button"
              onClick={addRequiredSkill}
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
              value={tempOptionalSkill}
              onChange={(e) => setTempOptionalSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionalSkill())}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: MongoDB, AWS, Docker"
            />
            <button
              type="button"
              onClick={addOptionalSkill}
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

      {/* Países Elegibles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Países Elegibles</label>
        <input
          type="text"
          value={(formData.eligibleCountries || []).join(', ')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            eligibleCountries: e.target.value ? e.target.value.split(',').map(c => c.trim()).filter(c => c) : []
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ej: Perú, Colombia, Chile (separados por comas)"
        />
      </div>

      {/* Información Académica/Laboral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Campo de Estudio</label>
          <input
            type="text"
            value={formData.fieldOfStudy || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Ej: Ingeniería, Medicina"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Modalidad</label>
          <select
            value={formData.modality || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, modality: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Seleccionar</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="híbrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Idioma</label>
          <input
            type="text"
            value={formData.language || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Ej: Español, Inglés"
          />
        </div>
      </div>

      {/* Información Financiera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto de Financiamiento</label>
          <input
            type="number"
            step="0.01"
            value={formData.fundingAmount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fundingAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Moneda</label>
          <select
            value={formData.currency || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Seleccionar</option>
            <option value="USD">USD - Dólar</option>
            <option value="PEN">PEN - Sol</option>
            <option value="EUR">EUR - Euro</option>
            <option value="COP">COP - Peso Colombiano</option>
            <option value="CLP">CLP - Peso Chileno</option>
          </select>
        </div>
      </div>

      {/* Rango Salarial */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rango Salarial</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.01"
              value={formData.salaryRange?.min || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                salaryRange: { 
                  ...prev.salaryRange, 
                  min: e.target.value ? parseFloat(e.target.value) : undefined 
                } 
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Mínimo"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={formData.salaryRange?.max || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                salaryRange: { 
                  ...prev.salaryRange, 
                  max: e.target.value ? parseFloat(e.target.value) : undefined 
                } 
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Máximo"
            />
          </div>
        </div>
      </div>

      {/* Fecha Límite */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha Límite</label>
        <input
          type="datetime-local"
          value={formData.deadline ? new Date(formData.deadline).toISOString().slice(0, 16) : ''}
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