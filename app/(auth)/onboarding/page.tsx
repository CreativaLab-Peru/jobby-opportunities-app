'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle, Loader2 } from 'lucide-react';

const TALENT_CATEGORIES = [
  { value: 'TECHNOLOGY_ENGINEERING', label: 'Tecnología e Ingeniería' },
  { value: 'DESIGN_CREATIVITY', label: 'Diseño y Creatividad' },
  { value: 'MARKETING_STRATEGY', label: 'Marketing y Estrategia' },
  { value: 'MANAGEMENT_BUSINESS', label: 'Gestión y Negocios' },
  { value: 'FINANCE_PROJECTS', label: 'Finanzas y Proyectos' },
  { value: 'SOCIAL_MEDIA', label: 'Redes Sociales' },
  { value: 'EDUCATION', label: 'Educación' },
  { value: 'SCIENCE', label: 'Ciencia' }
];

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev => 
      prev.includes(value) 
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      setError('Por favor selecciona al menos una categoría');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          talentCategories: selectedCategories
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      // Esperar un momento y hacer hard reload para garantizar sesión actualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar onboarding');
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¿Qué tipo de talento buscas?
          </h1>
          <p className="text-gray-600">
            Selecciona las categorías que te interesan para comenzar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-3 mb-8">
            {TALENT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => toggleCategory(category.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-4 rounded-lg border-2 transition-all
                  ${selectedCategories.includes(category.value)
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all
                  ${selectedCategories.includes(category.value)
                    ? 'border-black bg-black'
                    : 'border-gray-300'
                  }
                `}>
                  {selectedCategories.includes(category.value) && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className={`
                  text-sm font-medium
                  ${selectedCategories.includes(category.value)
                    ? 'text-gray-900'
                    : 'text-gray-600'
                  }
                `}>
                  {category.label}
                </span>
              </button>
            ))}
          </div>

          {/* Selected count */}
          {selectedCategories.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                {selectedCategories.length} {selectedCategories.length === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
              </p>
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedCategories.length === 0}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Continuar al Dashboard'
            )}
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Podrás modificar estas preferencias más adelante
        </p>
      </div>
    </div>
  );
}
