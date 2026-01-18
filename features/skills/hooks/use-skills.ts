import { useState, useCallback, useEffect } from 'react';
import {useSession} from "@/lib/auth-client";
import api from "@/lib/api";
import axios from "axios";

export interface Skill {
  id: string;
  name: string;
  key: string;
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useSkills(initialSearch: string = "") {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // 1. Fetch con Query Params
  const fetchSkills = useCallback(async (searchName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchValue = searchName !== undefined ? searchName : searchTerm;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        ...(searchTerm && { name: searchValue }), // Solo agrega 'name' si hay texto
      });

      const response = await api.get(`/api/skills?${params.toString()}`);
      if (!response.data) throw new Error('Error al cargar skills');

      const data = await response.data;

      // Asumimos que la API devuelve { skills: [], pagination: {} }
      setSkills(data.skills || []);
      setPagination(data.pagination || {
        total: data.skills?.length || 0,
        totalPages: 1,
        currentPage: 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  // 2. Efecto para disparar la búsqueda
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // 3. Crear una nueva skill (POST)
  const createSkill = async (name: string) => {
    setError(null);
    try {
      const response = await axios.post('/api/skills', {name});

      if (!response?.data) {
        console.error('No se recibió data al crear la skill');
        setError("Error al crear la skill");
        return;
      }

      // Al crear, refrescamos para mantener la sincronía con la paginación del servidor
      await fetchSkills();

      return response.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear';
      setError(msg);
      throw err;
    }
  };

  return {
    skills,
    isLoading,
    error,
    // Controladores
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pagination,
    // Acciones
    createSkill,
    fetchSkills,
  };
}
