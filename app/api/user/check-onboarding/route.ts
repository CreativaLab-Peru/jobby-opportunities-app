import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Verificar si el usuario completó el onboarding
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true }
    });

    return NextResponse.json({
      onboardingCompleted: user?.onboardingCompleted || false
    });

  } catch (error) {
    console.error('Error verificando onboarding:', error);
    return NextResponse.json(
      { error: 'Error al verificar onboarding' },
      { status: 500 }
    );
  }
}
