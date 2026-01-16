import { NextResponse } from 'next/server';
import { generateSearchVector } from "@/lib/matching/utils";
import { prisma } from '@/lib/prisma';
import {getCanonicalSkill} from "@/lib/matching/skills-utils";

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
    const types = searchParams.getAll('types').filter(t => t);
    const levels = searchParams.getAll('levels').filter(l => l);
    const countries = searchParams.getAll('countries').filter(c => c);
    const modality = searchParams.get('modality');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const deadlineFrom = searchParams.get('deadlineFrom');
    const deadlineTo = searchParams.get('deadlineTo');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir objeto where dinámicamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      // userId: userID
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

    // Construir orderBy dinámicamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};

    // Mapeo de campos válidos para ordenar
    const validSortFields = ['createdAt', 'deadline', 'title', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

    // Obtener oportunidades paginadas
    const opportunities = await prisma.opportunity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy
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

export async function POST(request: Request) {
  try {
    const userID = request.headers.get('user-id');
    if (!userID) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Normalización de Skills y actualización del diccionario Tag
    const rawSkills = [
      ...(body.requiredSkills || []),
      ...(body.optionalSkills || []),
      ...(body.tags || [])
    ];

    // Obtenemos skills únicos y normalizados (ej: "React.js" -> "react")
    const normalizedSkills = Array.from(new Set(rawSkills.map(getCanonicalSkill)));

    // Upsert masivo en segundo plano o paralelo para el diccionario maestro
    await Promise.all(
      normalizedSkills.map(skillName =>
        prisma.tag.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName, category: "skill" }
        })
      )
    );

    // 2. Preparación de la data para MongoDB
    const createData = {
      type: body.type,
      title: body.title,
      organization: body.organization,
      url: body.url || null,
      description: body.description,
      language: body.language || "ES",

      // Enums y Clasificación
      modality: body.modality || "ON_SITE",
      status: "ACTIVE",

      // Arrays normalizados para evitar fallos en el matching
      eligibleLevels: (body.eligibleLevels || []).map((l: string) => l.toUpperCase()),
      eligibleCountries: (body.eligibleCountries || []).map((c: string) => c.toUpperCase()),
      requiredSkills: (body.requiredSkills || []).map(getCanonicalSkill),
      optionalSkills: (body.optionalSkills || []).map(getCanonicalSkill),

      fieldOfStudy: body.fieldOfStudy || null,

      // Salarios (Doble entrada: para filtro rápido y para objeto embebido)
      minSalary: body.salaryRange?.min ? parseFloat(body.salaryRange.min) : null,
      maxSalary: body.salaryRange?.max ? parseFloat(body.salaryRange.max) : null,
      salaryRange: body.salaryRange ? {
        min: body.salaryRange.min ? parseFloat(body.salaryRange.min) : null,
        max: body.salaryRange.max ? parseFloat(body.salaryRange.max) : null,
      } : null,
      currency: body.currency || "USD",

      // Metadata de búsqueda (Optimiza el embedding)
      searchVector: generateSearchVector({
        title: body.title,
        description: body.description,
        organization: body.organization,
        skills: normalizedSkills
      }),

      deadline: body.deadline ? new Date(body.deadline) : null,
      popularityScore: body.popularityScore ? parseInt(body.popularityScore) : 0,
      userId: userID,
    };

    const opportunity = await prisma.opportunity.create({
      data: createData
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('[CREATE_OPPORTUNITY_ERROR]:', error);
    return NextResponse.json(
      { error: 'Error al crear la oportunidad' },
      { status: 500 }
    );
  }
}
