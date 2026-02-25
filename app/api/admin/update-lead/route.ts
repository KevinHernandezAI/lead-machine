export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

const LEAD_STATUSES = new Set(['NEW', 'CONTACTED', 'BOOKED', 'CLOSED']);

export async function POST(req: Request) {
  try {
    const [{ prisma }, { isAuthenticated }] = await Promise.all([import('@/lib/prisma'), import('@/lib/auth')]);

    if (!isAuthenticated()) return new NextResponse('Unauthorized', { status: 401 });

    const formData = await req.formData();
    const id = String(formData.get('id') || '');
    const statusRaw = String(formData.get('status') || 'NEW');
    const internalNotes = String(formData.get('internalNotes') || '');

    const status = LEAD_STATUSES.has(statusRaw) ? statusRaw : 'NEW';

    await prisma.lead.update({ where: { id }, data: { status, internalNotes } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('UPDATE LEAD API ERROR:', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}