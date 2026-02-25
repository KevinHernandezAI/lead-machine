'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const LEAD_STATUSES = ['ALL', 'NEW', 'CONTACTED', 'BOOKED', 'CLOSED'] as const;

export default function AdminHome() {
  const [status, setStatus] = useState<(typeof LEAD_STATUSES)[number]>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads?status=${encodeURIComponent(status)}`, { cache: 'no-store' });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed (${res.status})`);
      }
      const j = await res.json();
      if (!j?.ok) throw new Error(j?.error || 'Failed');
      setLeads(j.leads || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const unauthorized = useMemo(() => (error || '').toLowerCase().includes('unauthorized'), [error]);

  if (unauthorized) {
    return (
      <main className="container-wrap py-12">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <form action="/api/admin/login" method="post" className="mt-4 max-w-sm space-y-3 rounded bg-white p-4 shadow">
          <input name="password" type="password" placeholder="Password" className="w-full rounded border p-2" required />
          <button className="w-full rounded bg-brand-600 py-2 text-white">Sign in</button>
        </form>
        <p className="mt-3 text-sm text-slate-600">After signing in, refresh this page if it doesn’t auto-load.</p>
      </main>
    );
  }

  return (
    <main className="container-wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Lead Dashboard</h1>
        <form action="/api/admin/logout" method="post">
          <button className="rounded bg-slate-800 px-3 py-2 text-white">Logout</button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded bg-white p-3 shadow">
        <label className="text-sm text-slate-700">
          Status
          <select
            className="ml-2 rounded border p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s}
              </option>
            ))}
          </select>
        </label>

        <button onClick={load} className="rounded border px-3 py-2 text-sm">
          Refresh
        </button>
      </div>

      {loading && <p className="mt-4">Loading…</p>}

      {!loading && error && !unauthorized && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-4 overflow-auto rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Client</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td className="p-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <Link className="text-brand-700 underline" href={`/admin/leads/${lead.id}`}>
                    {lead.name}
                  </Link>
                </td>
                <td className="p-2">{lead.serviceType}</td>
                <td className="p-2">{lead.status}</td>
                <td className="p-2">{lead.client?.name}</td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td className="p-3 text-slate-600" colSpan={5}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}