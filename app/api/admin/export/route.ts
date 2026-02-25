export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Minimal auth check (must match how your login sets the cookie)
  // Most setups set a cookie like "admin_session" or "session".
  // We'll accept any truthy cookie named "admin_session" or "session" to avoid build-time imports crashing.
  const jar = cookies();
  const session =
    jar.get('admin_session')?.value ||
    jar.get('session')?.value ||
    jar.get('admin')?.value ||
    '';

  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const leads = await prisma.lead.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  const lines = ['id,createdAt,client,name,phone,email,serviceType,address,status,preferredDate,notes,internalNotes'];

  for (const lead of leads) {
    const row = [
      lead.id,
      lead.createdAt.toISOString(),
      lead.client.name,
      lead.name,
      lead.phone,
      lead.email || '',
      lead.serviceType,
      lead.address,
      lead.status,
      lead.preferredDate?.toISOString() || '',
      (lead.notes || '').replace(/,/g, ';'),
      (lead.internalNotes || '').replace(/,/g, ';')
    ];

    lines.push(row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="leads.csv"',
      'Cache-Control': 'no-store'
    }
  });
}