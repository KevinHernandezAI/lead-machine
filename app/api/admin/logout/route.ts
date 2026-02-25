export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  clearSessionCookie();
  return NextResponse.redirect(new URL('/admin', req.url));
}
