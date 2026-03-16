import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/actions/get-session';
import { processBulkRows } from '@/features/opportunities/actions/bulk-upload';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.success || !session.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const options = body.options || {};

    const result = await processBulkRows(rows, options);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

