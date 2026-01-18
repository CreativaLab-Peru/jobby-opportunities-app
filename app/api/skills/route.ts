import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {slugify} from "@/utils/slugify";
import {getSession} from "@/features/auth/actions/get-session";

// GET - Obtener skills con búsqueda y paginación
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    // Parámetro de búsqueda
    const name = searchParams.get('name') || undefined;

    // Construcción del filtro
    const where: any = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // Ignorar mayúsculas/minúsculas
      };
    }

    // Ejecutar conteo y búsqueda en paralelo para mejor performance
    const [total, skills] = await Promise.all([
      prisma.skill.count({ where }),
      prisma.skill.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }, // Siempre alfabético para selectores
      }),
    ]);

    return NextResponse.json({
      skills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[SKILLS_GET_ERROR]:', error);
    return NextResponse.json(
      { error: 'Error al obtener las habilidades' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva skill
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.success) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre de la habilidad es demasiado corto' },
        { status: 400 }
      );
    }

    const key = slugify(name);

    // Intentar encontrar si ya existe por key para evitar duplicados
    const existingSkill = await prisma.skill.findUnique({
      where: { key }
    });

    if (existingSkill) {
      // Si ya existe, la devolvemos como si se hubiera creado (Idempotencia)
      return NextResponse.json(existingSkill, { status: 200 });
    }

    // Crear la nueva habilidad
    const newSkill = await prisma.skill.create({
      data: {
        name: name.trim(),
        key: key,
      },
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error: any) {
    // Manejo de error de unicidad de Prisma (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Esta habilidad ya existe' },
        { status: 400 }
      );
    }

    console.error('[SKILLS_POST_ERROR]:', error);
    return NextResponse.json(
      { error: 'Error al crear la habilidad' },
      { status: 500 }
    );
  }
}
