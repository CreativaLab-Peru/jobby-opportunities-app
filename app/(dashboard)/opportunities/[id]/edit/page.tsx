'use client';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import OpportunityForm from '@/components/opportunity-form';
import { Opportunity, OpportunityFormData } from '../../../../types/opportunity';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EditOpportunityPageProps {
  params: Promise<{ id: string }>;
}

export default function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [opportunityId, setOpportunityId] = useState<string>('');

  useEffect(() => {
    params.then(p => setOpportunityId(p.id));
  }, [params]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`);
        if (response.ok) {
          const data = await response.json();
          setOpportunity(data);
        } else {
          alert('No se pudo cargar la oportunidad');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la oportunidad');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId && session) {
      fetchOpportunity();
    }
  }, [opportunityId, session, router]);

  const handleUpdate = async (formData: OpportunityFormData) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar oportunidad');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar oportunidad: ${errorMessage}`);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session || !opportunity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/*<nav className="bg-white shadow">*/}
      {/*  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*    <div className="flex justify-between h-16">*/}
      {/*      <div className="flex items-center">*/}
      {/*        <Link href="/dashboard" className="text-xl font-semibold hover:text-indigo-600">*/}
      {/*          ← Volver al Dashboard*/}
      {/*        </Link>*/}
      {/*      </div>*/}
      {/*      <div className="flex items-center">*/}
      {/*        <span className="text-gray-700">{session?.user?.name}</span>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</nav>*/}

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Editar Oportunidad
          </h1>

          <div className="bg-white shadow rounded-lg p-6">
            <OpportunityForm
              opportunity={opportunity}
              onSubmit={handleUpdate}
              onCancel={() => router.push('/dashboard')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
