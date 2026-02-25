export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'BOOKED', 'CLOSED'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

async function updateLead(formData: FormData) {
  'use server';
  if (!isAuthenticated()) redirect('/admin');

  const id = String(formData.get('id') || '');
  const statusRaw = String(formData.get('status') || '');
  const internalNotes = String(formData.get('internalNotes') || '');

  // Only allow known statuses
  const status: LeadStatus = (LEAD_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as LeadStatus)
    : 'NEW';

  await prisma.lead.update({ where: { id }, data: { status, internalNotes } });
  redirect(`/admin/leads/${id}`);
}

export default async function LeadDetail({ params }: { params: { id: string } }) {
  if (!isAuthenticated()) redirect('/admin');

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { client: true }
  });

  if (!lead) notFound();

  return (
    <main className="container-wrap py-8">
      <a href="/admin" className="text-sm text-brand-700 underline">
        ← Back
      </a>

      <h1 className="mt-2 text-2xl font-bold">{lead.name}</h1>
      <p>
        {lead.phone} • {lead.email || 'No email'}
      </p>
      <p>
        {lead.serviceType} • {lead.address}
      </p>

      {lead.preferredDate && <p>Preferred date: {lead.preferredDate.toDateString()}</p>}
      {lead.notes && <p className="mt-2">Notes: {lead.notes}</p>}

      {lead.photoUrl && (
        <Image src={lead.photoUrl} alt="Lead upload" width={300} height={200} className="mt-3 rounded" />
      )}

      <form action={updateLead} className="mt-4 max-w-lg space-y-3 rounded bg-white p-4 shadow">
        <input type="hidden" name="id" value={lead.id} />

        <label className="block">
          Status
          <select name="status" defaultValue={lead.status} className="mt-1 w-full rounded border p-2">
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          Internal notes
          <textarea
            name="internalNotes"
            defaultValue={lead.internalNotes || ''}
            className="mt-1 w-full rounded border p-2"
            rows={4}
          />
        </label>

        <button className="rounded bg-brand-600 px-4 py-2 text-white">Save</button>
      </form>
    </main>
  );
}