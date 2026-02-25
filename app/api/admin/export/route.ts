export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function hasAdminSession(cookieHeader: string | null) {
  if (!cookieHeader) return false;

  // look for a cookie that indicates admin is logged in
  // adjust names later once we confirm your actual cookie name
  const candidates = ['admin_session', 'session', 'admin'];
  return candidates.some((name) => {
    const re = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
    return re.test(cookieHeader);
  });
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');

  if (!hasAdminSession(cookieHeader)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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