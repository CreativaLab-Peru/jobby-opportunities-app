import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {KEY_STS} from "@/lib/key-sts";


export async function POST(request: Request) {
  try {
    if (!KEY_STS) {
      return NextResponse.json(
        {error: 'Clave de seguridad no configurada'},
        {status: 500}
      );
    }

    const headers = request.headers;
    const SysTSys = headers.get('x-sys-sys')

    if (KEY_STS != SysTSys) {
      return new NextResponse(null, {status: 404})
    }

    console.log("[SysTSys]:", SysTSys)
    const {searchParams} = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const types = searchParams.getAll('types').filter(t => t);
    const where: any = {};

    if (types && types.length > 0) {
      where.OR = types.map(t => ({
        type: {contains: t, mode: "insensitive"}
      }));
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({opp: opportunities});
  } catch (error) {
    console.error('[ERROR_GET_OPPORTUNITIES_FOR_MATCHING]', error);
    return NextResponse.json(
      {error: 'Error interno del servidor'},
      {status: 500}
    );
  }
}
