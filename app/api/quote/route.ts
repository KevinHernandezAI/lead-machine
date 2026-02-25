export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { leadSchema } from '@/lib/types';
import { sendLeadNotifications } from '@/lib/notifications';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function toNullableDate(value: unknown): Date | null {
  if (!value) return null;

  // If Zod preprocess already turned it into a Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // If it is still a string (e.g., "2026-02-26")
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const clientSlugRaw = formData.get('clientSlug');
    const clientSlug = typeof clientSlugRaw === 'string' ? clientSlugRaw : '';

    if (!clientSlug) {
      return NextResponse.json({ ok: false, error: 'Missing clientSlug' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client) return NextResponse.json({ ok: false, error: 'Client not found' }, { status: 404 });

    // Validate input WITHOUT throwing
    const parsed = leadSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      serviceType: formData.get('serviceType'),
      address: formData.get('address'),
      preferredDate: formData.get('preferredDate'),
      notes: formData.get('notes')
    });

    if (!parsed.success) {
      // Return a useful error for debugging (and still safe for users)
      return NextResponse.json(
        { ok: false, where: 'leadSchema', error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // Handle optional upload
    let photoUrl: string | undefined;
    const photo = formData.get('photo');

    if (photo instanceof File && photo.size > 0) {
      if (!ALLOWED_TYPES.has(photo.type) || photo.size > MAX_FILE_SIZE) {
        return NextResponse.json({ ok: false, error: 'Invalid upload' }, { status: 400 });
      }

      const ext = photo.type.split('/')[1];
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const target = path.join(uploadsDir, filename);
      await fs.writeFile(target, Buffer.from(await photo.arrayBuffer()));
      photoUrl = `/uploads/${filename}`;
    }

    // Save lead first (this should succeed even if notifications fail)
    const lead = await prisma.lead.create({
      data: {
        clientId: client.id,
        name: payload.name,
        phone: payload.phone,
        email: payload.email ? payload.email : null,
        serviceType: payload.serviceType,
        address: payload.address,
        preferredDate: toNullableDate((payload as any).preferredDate),
        notes: payload.notes ? payload.notes : null,
        photoUrl,
        status: 'NEW'
      }
    });

    // Best-effort notifications: NEVER block lead creation
    try {
      const dashboardUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/leads/${lead.id}`;
      const message = `New lead: ${lead.name} | ${lead.phone} | ${lead.serviceType} | ${lead.address}`;

      // If env vars are missing, your notification function might throw — we swallow it.
      await sendLeadNotifications({
        clientId: client.id,
        leadId: lead.id,
        message,
        dashboardUrl,
        sendEmail: client.notifyByEmail,
        sendSms: client.notifyBySms,
        recipientEmail: client.emailRecipients || process.env.NOTIFY_EMAIL_TO || '',
        recipientSms: process.env.NOTIFY_SMS_TO
      });
    } catch (err) {
      console.error('Notification error (non-blocking):', err);
    }

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    console.error('QUOTE API ERROR:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}