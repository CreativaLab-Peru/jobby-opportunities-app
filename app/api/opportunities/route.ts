import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener oportunidades del usuario actual
export async function GET(request: Request) {
  try {
    const userID = request.headers.get('user-id');
    
    if (!userID) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { 
        userId: userID
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(opportunities);
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