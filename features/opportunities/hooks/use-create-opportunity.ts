import { useState } from 'react';
import { OpportunityFormData } from '@/app/types/opportunity';

export function useCreateOpportunity(userId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOpportunity = async (formData: OpportunityFormData) => {
    if (!userId) {
      setError("No hay una sesión activa");
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la oportunidad');
      }

      return await response.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createOpportunity, isSubmitting, error };
}
