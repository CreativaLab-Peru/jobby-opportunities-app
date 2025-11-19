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
        userId: userID // ← Solo oportunidades del usuario actual
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
    // TODO: Obtener userID del request (autenticación)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      type: body.type,
      title: body.title,
      organization: body.organization,
      url: body.url || null,
      eligibleLevels: body.eligibleLevels || [],
      eligibleCountries: body.eligibleCountries || [],
      tags: body.tags || [],
      requiredSkills: body.requiredSkills || [],
      optionalSkills: body.optionalSkills || [],
      normalizedTags: body.normalizedTags || [],
      userId: userID,
    };
    
    // Campos opcionales - solo agregar si tienen valor
    if (body.minAge !== undefined && body.minAge !== null && body.minAge !== '') {
      createData.minAge = parseInt(body.minAge);
    }
    if (body.maxAge !== undefined && body.maxAge !== null && body.maxAge !== '') {
      createData.maxAge = parseInt(body.maxAge);
    }
    if (body.fieldOfStudy) createData.fieldOfStudy = body.fieldOfStudy;
    if (body.modality) createData.modality = body.modality;
    if (body.language) createData.language = body.language;
    if (body.fundingAmount !== undefined && body.fundingAmount !== null && body.fundingAmount !== '') {
      createData.fundingAmount = parseFloat(body.fundingAmount);
    }
    if (body.currency) createData.currency = body.currency;
    if (body.popularityScore !== undefined && body.popularityScore !== null) {
      createData.popularityScore = parseInt(body.popularityScore);
    }
    
    // Manejar deadline - convertir string a Date o dejar undefined
    if (body.deadline && body.deadline !== '') {
      createData.deadline = new Date(body.deadline);
    }
    
    // Manejar salaryRange si existe
    if (body.salaryRange && (body.salaryRange.min || body.salaryRange.max)) {
      createData.salaryRange = {
        min: body.salaryRange.min ? parseFloat(body.salaryRange.min) : null,
        max: body.salaryRange.max ? parseFloat(body.salaryRange.max) : null,
      };
    }
    
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