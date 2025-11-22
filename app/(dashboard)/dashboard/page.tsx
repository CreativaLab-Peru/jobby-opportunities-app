'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import OpportunityList from '@/components/OpportunityList';
import { OpportunityListItem } from '../../types/opportunity';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [opportunities, setOpportunities] = useState<OpportunityListItem[]>([]);
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

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
      try {
        const response = await fetch(`/api/opportunities/${id}`, { 
          method: 'DELETE' 
        });

        if (!response.ok) {
          throw new Error('Error al eliminar oportunidad');
        }

        fetchOpportunities();
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
    return null; 
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
              Mis Oportunidades ({opportunities.length})
            </h2>
            <Link
              href="/opportunities/new"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white font-medium inline-block"
            >
              + Nueva Oportunidad
            </Link>
          </div>

          {loading ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-lg">Cargando oportunidades...</div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">No tienes oportunidades creadas aún</p>
              <Link
                href="/opportunities/new"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Crear tu primera oportunidad
              </Link>
            </div>
          ) : (
            <OpportunityList
              opportunities={opportunities}
              onEdit={(opp) => router.push(`/opportunities/${opp.id}/edit`)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}