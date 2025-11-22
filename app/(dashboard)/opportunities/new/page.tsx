'use client';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import OpportunityForm from '@/components/OpportunityForm';
import { OpportunityFormData } from '../../../types/opportunity';
import Link from 'next/link';
import { useEffect } from 'react';

export default function NewOpportunityPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleCreate = async (formData: OpportunityFormData) => {
    try {
      console.log('Enviando datos:', formData);
      
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': session?.user?.id || ''
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear oportunidad');
      }

      const result = await response.json();
      console.log('Oportunidad creada:', result);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear oportunidad: ${errorMessage}`);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-semibold hover:text-indigo-600">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{session?.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Nueva Oportunidad
          </h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <OpportunityForm
              onSubmit={handleCreate}
              onCancel={() => router.push('/dashboard')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
