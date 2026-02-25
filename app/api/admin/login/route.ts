export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { createSessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = String(formData.get('password') || '');

  if (!verifyPassword(password)) {
    return NextResponse.redirect(new URL('/admin?error=1', req.url));
  }

  createSessionCookie();
  return NextResponse.redirect(new URL('/admin', req.url));
}
