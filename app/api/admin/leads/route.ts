export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const [{ prisma }, { isAuthenticated }] = await Promise.all([import('@/lib/prisma'), import('@/lib/auth')]);

    if (!isAuthenticated()) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';

    const where = status !== 'ALL' ? { status } : undefined;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
      take: 200
    });

    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    console.error('ADMIN LEADS API ERROR:', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}