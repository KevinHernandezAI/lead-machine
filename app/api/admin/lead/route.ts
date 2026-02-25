export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Lazy imports so build-time import won't touch Prisma/auth
    const [{ prisma }, { isAuthenticated }] = await Promise.all([import('@/lib/prisma'), import('@/lib/auth')]);

    if (!isAuthenticated()) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    console.error('ADMIN LEAD API ERROR:', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}