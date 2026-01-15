import { NextRequest, NextResponse } from 'next/server';
import { scoreOpportunity } from '@/lib/matching/engine';
import {prisma} from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string; cvId: string } }
) {
  try {
    const { userId, cvId } = params;
    const body = await req.json();
    const { cv, top_k = 5 } = body;

    // 1. Get opportunities
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc'}
    })

    // 2. Ejecutar Matching en paralelo
    const results = await Promise.all(
      opportunities.map((o) => scoreOpportunity(cv, o))
    );

    // 3. Ordenar y filtrar
    const sortedResults = results
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, top_k);

    return NextResponse.json({
      user_id: userId,
      cv_id: cvId,
      matches: sortedResults
    });

  } catch (error) {
    console.error("[ERROR_MATCH_OPPORTUNITIES]", error);
    return NextResponse.json({ error: "Algo ha sucedido" }, { status: 500 });
  }
}
