import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { landingConfigSchema } from '@/lib/types';
import { SettingsEditor } from './settings-editor';

async function updateSettings(formData: FormData) {
  'use server';
  if (!isAuthenticated()) redirect('/admin');
  const clientId = String(formData.get('clientId'));
  const landingConfigJson = String(formData.get('landingConfigJson'));
  landingConfigSchema.parse(JSON.parse(landingConfigJson));

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: String(formData.get('name')),
      phone: String(formData.get('phone')),
      emailRecipients: String(formData.get('emailRecipients')),
      serviceArea: String(formData.get('serviceArea')),
      logoUrl: String(formData.get('logoUrl') || ''),
      stripePaymentLink: String(formData.get('stripePaymentLink') || ''),
      notifyByEmail: formData.get('notifyByEmail') === 'on',
      notifyBySms: formData.get('notifyBySms') === 'on',
      landingConfigJson
    }
  });

  redirect('/admin/settings?saved=1');
}

export default async function SettingsPage() {
  if (!isAuthenticated()) redirect('/admin');
  const client = await prisma.client.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!client) return <main className="container-wrap py-10">No client found.</main>;

  return (
    <main className="container-wrap py-8">
      <a href="/admin" className="text-sm text-brand-700 underline">← Back to dashboard</a>
      <h1 className="mt-2 text-2xl font-bold">Settings</h1>
      <SettingsEditor client={client} action={updateSettings} />
    </main>
  );
}
