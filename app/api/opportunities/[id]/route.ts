import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error obteniendo oportunidad:', error);
    return NextResponse.json(
      { error: 'Error al obtener oportunidad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('Actualizando oportunidad:', id);
    console.log('Datos recibidos:', body);
    
    // Preparar los datos con valores por defecto para arrays y conversiones necesarias
    const updateData = {
      type: body.type,
      title: body.title,
      organization: body.organization,
      url: body.url || null,
      description: body.description || null,
      eligibleLevels: body.eligibleLevels || [],
      eligibleCountries: body.eligibleCountries || [],
      tags: body.tags || [],
      requiredSkills: body.requiredSkills || [],
      optionalSkills: body.optionalSkills || [],
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
    
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData
    });
    
    console.log('Oportunidad actualizada exitosamente:', opportunity.id);
    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error actualizando oportunidad:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al actualizar oportunidad', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Eliminando oportunidad:', id);
    
    await prisma.opportunity.delete({
      where: { id }
    });
    
    console.log('Oportunidad eliminada exitosamente');
    return NextResponse.json({ message: 'Oportunidad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando oportunidad:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al eliminar oportunidad', details: errorMessage },
      { status: 500 }
    );
  }
}