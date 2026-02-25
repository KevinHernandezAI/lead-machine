'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'BOOKED', 'CLOSED'] as const;

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<any>(null);

  const id = params.id;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lead?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed (${res.status})`);
      }
      const j = await res.json();
      if (!j?.ok) throw new Error(j?.error || 'Failed');
      setLead(j.lead);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const created = useMemo(() => {
    if (!lead?.createdAt) return '';
    return new Date(lead.createdAt).toLocaleString();
  }, [lead]);

  const preferred = useMemo(() => {
    if (!lead?.preferredDate) return '';
    return new Date(lead.preferredDate).toDateString();
  }, [lead]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/update-lead', { method: 'POST', body: formData });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      setError(txt || `Save failed (${res.status})`);
      return;
    }

    await load();
  }

  return (
    <main className="container-wrap py-8">
      <Link href="/admin" className="text-sm text-brand-700 underline">
        ← Back
      </Link>

      {loading && <p className="mt-4">Loading…</p>}

      {!loading && error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.includes('Unauthorized') ? 'Unauthorized. Go back and sign in again.' : error}
        </div>
      )}

      {!loading && lead && (
        <>
          <h1 className="mt-2 text-2xl font-bold">{lead.name}</h1>
          <p className="text-sm text-slate-700">
            {lead.phone} • {lead.email || 'No email'}
          </p>
          <p className="text-sm text-slate-700">
            {lead.serviceType} • {lead.address}
          </p>

          <p className="mt-2 text-xs text-slate-500">Created: {created}</p>
          {lead.preferredDate && <p className="mt-2">Preferred date: {preferred}</p>}
          {lead.notes && <p className="mt-2">Notes: {lead.notes}</p>}

          {lead.photoUrl && (
            <Image src={lead.photoUrl} alt="Lead upload" width={300} height={200} className="mt-3 rounded" />
          )}

          <form onSubmit={save} className="mt-4 max-w-lg space-y-3 rounded bg-white p-4 shadow">
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
        </>
      )}
    </main>
  );
}