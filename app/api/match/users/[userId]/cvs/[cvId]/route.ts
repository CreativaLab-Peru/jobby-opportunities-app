import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";
import {scoreOpportunity} from "@/lib/matching/engine";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string; cvId: string }> }
) {
  try {
    const { userId, cvId } = await context.params;

    const body = await req.json();
    const { cv, top_k = 5 } = body;

    const opportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const results = await Promise.all(
      opportunities.map((o) => scoreOpportunity(cv, o))
    );

    const sortedResults = results
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, top_k);

    return NextResponse.json({
      user_id: userId,
      cv_id: cvId,
      matches: sortedResults,
    });
  } catch (error) {
    console.error('[ERROR_MATCH_OPPORTUNITIES]', error);
    return NextResponse.json(
      { error: 'Algo ha sucedido' },
      { status: 500 }
    );
  }
}
