'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import OpportunityList from '@/components/OpportunityList';
import OpportunityForm from '@/components/OpportunityForm';
import { Opportunity, OpportunityFormData, OpportunityListItem } from '../../types/opportunity';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [opportunities, setOpportunities] = useState<OpportunityListItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [loading, setLoading] = useState(true);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const fetchOpportunities = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/opportunities', {
        headers: { 
            'user-id': session.user.id
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Cargar oportunidades
  useEffect(() => {
    if (session?.user) {
      fetchOpportunities();
    }
  }, [session?.user, fetchOpportunities]);

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

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Error al crear oportunidad');
      }

      const result = await response.json();
      console.log('Oportunidad creada:', result);
      
      setShowForm(false);
      fetchOpportunities();
      
    } catch (error) {
      console.error('Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear oportunidad: ${errorMessage}`);
    }
  };

  const handleUpdate = async (formData: OpportunityFormData) => {
    if (editingOpportunity) {
      try {
        console.log('Actualizando oportunidad:', editingOpportunity.id, formData);
        
        const response = await fetch(`/api/opportunities/${editingOpportunity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Error al actualizar oportunidad');
        }

        const result = await response.json();
        console.log('Oportunidad actualizada:', result);

        setEditingOpportunity(undefined);
        fetchOpportunities();
      } catch (error) {
        console.error('Error completo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        alert(`Error al actualizar oportunidad: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
      try {
        const response = await fetch(`/api/opportunities/${id}`, { 
          method: 'DELETE' 
        });

        if (!response.ok) {
          throw new Error('Error al eliminar oportunidad');
        }

        fetchOpportunities(); // Recargar la lista
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar oportunidad');
      }
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
    return null; // Será redirigido por el useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, {session?.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-white text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Oportunidades ({opportunities.length})
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white font-medium"
            >
              Nueva Oportunidad
            </button>
          </div>

          {showForm && (
            <div className="mb-6">
              <OpportunityForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {editingOpportunity && (
            <div className="mb-6">
              <OpportunityForm
                opportunity={editingOpportunity}
                onSubmit={handleUpdate}
                onCancel={() => setEditingOpportunity(undefined)}
              />
            </div>
          )}

          {loading ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-lg">Cargando oportunidades...</div>
            </div>
          ) : (
            <OpportunityList
              opportunities={opportunities}
              onEdit={(opp) => {
                // Convertir OpportunityListItem a Opportunity para edición
                setEditingOpportunity({
                  ...opp,
                  eligibleLevels: [],
                  eligibleCountries: [],
                  tags: [],
                  requiredSkills: [],
                  optionalSkills: [],
                  normalizedTags: []
                });
              }}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}