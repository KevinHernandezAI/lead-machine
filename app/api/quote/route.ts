import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { leadSchema } from '@/lib/types';
import { sendLeadNotifications } from '@/lib/notifications';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const clientSlug = String(formData.get('clientSlug') || '');
    const client = await prisma.client.findUnique({ where: { slug: clientSlug } });

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const payload = leadSchema.parse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      serviceType: formData.get('serviceType'),
      address: formData.get('address'),
      preferredDate: formData.get('preferredDate'),
      notes: formData.get('notes')
    });

    let photoUrl: string | undefined;
    const photo = formData.get('photo');
    if (photo instanceof File && photo.size > 0) {
      if (!ALLOWED_TYPES.has(photo.type) || photo.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
      }
      const ext = photo.type.split('/')[1];
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const target = path.join(process.cwd(), 'public', 'uploads', filename);
      await fs.writeFile(target, Buffer.from(await photo.arrayBuffer()));
      photoUrl = `/uploads/${filename}`;
    }

    const lead = await prisma.lead.create({
      data: {
        clientId: client.id,
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        serviceType: payload.serviceType,
        address: payload.address,
        preferredDate: payload.preferredDate ? new Date(payload.preferredDate) : null,
        notes: payload.notes || null,
        photoUrl
      }
    });

    const dashboardUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/leads/${lead.id}`;
    const message = `New lead: ${lead.name} | ${lead.phone} | ${lead.serviceType} | ${lead.address}`;

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 400 });
  }
}
