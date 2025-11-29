import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener oportunidades del usuario actual con filtros y paginación
export async function GET(request: Request) {
  try {
    const userID = request.headers.get('user-id');
    
    if (!userID) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Filtros
    const types = searchParams.get('types')?.split(',').filter(t => t);
    const levels = searchParams.get('levels')?.split(',').filter(l => l);
    const countries = searchParams.get('countries')?.split(',').filter(c => c);
    const modality = searchParams.get('modality');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const deadlineFrom = searchParams.get('deadlineFrom');
    const deadlineTo = searchParams.get('deadlineTo');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');

    // Construir objeto where dinámicamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: userID
    };

    // Filtros de arrays
    if (types && types.length > 0) {
      where.type = { in: types };
    }

    if (levels && levels.length > 0) {
      where.eligibleLevels = { hasSome: levels };
    }

    if (countries && countries.length > 0) {
      where.eligibleCountries = { hasSome: countries };
    }

    // Filtros de texto
    if (modality) {
      where.modality = modality;
    }

    if (language) {
      where.language = { contains: language, mode: 'insensitive' };
    }

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro de fechas
    if (deadlineFrom || deadlineTo) {
      where.deadline = {};
      if (deadlineFrom) {
        where.deadline.gte = new Date(deadlineFrom);
      }
      if (deadlineTo) {
        where.deadline.lte = new Date(deadlineTo);
      }
    }

    // Filtro de salario
    if (salaryMin || salaryMax) {
      where.salaryRange = {};
      if (salaryMin) {
        where.salaryRange.min = { gte: parseFloat(salaryMin) };
      }
      if (salaryMax) {
        where.salaryRange.max = { lte: parseFloat(salaryMax) };
      }
    }

    // Obtener total de resultados
    const total = await prisma.opportunity.count({ where });

    // Obtener oportunidades paginadas
    const opportunities = await prisma.opportunity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo oportunidades:', error);
    return NextResponse.json(
      { error: 'Error al obtener oportunidades' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva oportunidad
export async function POST(request: Request) {
  try {
    const userID = request.headers.get('user-id');
    
    if (!userID) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
    }

    const body = await request.json();
    
    console.log('Creando nueva oportunidad');
    console.log('Datos recibidos:', body);
    
    // Preparar los datos con valores por defecto y conversiones necesarias
    const createData = {
      type: body.type,
      title: body.title,
      organization: body.organization,
      url: body.url || null,
      eligibleLevels: body.eligibleLevels || [],
      eligibleCountries: body.eligibleCountries || [],
      tags: body.tags || [],
      requiredSkills: body.requiredSkills || [],
      optionalSkills: body.optionalSkills || [],
      userId: userID,
      fieldOfStudy: body.fieldOfStudy || null,
      modality: body.modality || null,
      language: body.language || null,
      fundingAmount: body.fundingAmount ? parseFloat(body.fundingAmount) : null,
      currency: body.currency || null,
      popularityScore: body.popularityScore ? parseInt(body.popularityScore) : 0,
      deadline: body.deadline ? new Date(body.deadline) : null,
      salaryRange: (body.salaryRange?.min || body.salaryRange?.max) ? {
        min: body.salaryRange.min ? parseFloat(body.salaryRange.min) : null,
        max: body.salaryRange.max ? parseFloat(body.salaryRange.max) : null,
      } : null
    };
    
    const opportunity = await prisma.opportunity.create({
      data: createData
    });
    
    console.log('Oportunidad creada exitosamente:', opportunity.id);
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creando oportunidad:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al crear oportunidad', details: errorMessage },
      { status: 500 }
    );
  }
}