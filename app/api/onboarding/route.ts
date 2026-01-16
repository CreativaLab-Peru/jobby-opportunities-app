import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PATCH - Completar onboarding
export async function PATCH(request: Request) {
  try {
    // Obtener sesión desde better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }
    
    const userID = session.user.id;

    const body = await request.json();
    const { talentCategories } = body;

    if (!talentCategories || !Array.isArray(talentCategories) || talentCategories.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos una categoría' },
        { status: 400 }
      );
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id: userID },
      data: {
        talentCategories,
        onboardingCompleted: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Error en onboarding:', error);
    return NextResponse.json(
      { error: 'Error al completar onboarding' },
      { status: 500 }
    );
  }
}
