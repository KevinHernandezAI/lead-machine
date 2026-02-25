export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'BOOKED', 'CLOSED'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

export default async function AdminHome({
  searchParams
}: {
  searchParams: { status?: string; from?: string; to?: string };
}) {
  if (!isAuthenticated()) {
    return (
      <main className="container-wrap py-12">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <form action="/api/admin/login" method="post" className="mt-4 max-w-sm space-y-3 rounded bg-white p-4 shadow">
          <input name="password" type="password" placeholder="Password" className="w-full rounded border p-2" required />
          <button className="w-full rounded bg-brand-600 py-2 text-white">Sign in</button>
        </form>
      </main>
    );
  }

  const statusParam = searchParams.status;
  const status =
    statusParam && statusParam !== 'ALL' && (LEAD_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as LeadStatus)
      : undefined;

  const where = {
    status,
    createdAt: {
      gte: searchParams.from ? new Date(searchParams.from) : undefined,
      lte: searchParams.to ? new Date(searchParams.to) : undefined
    }
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });

  return (
    <main className="container-wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Lead Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/settings" className="rounded border px-3 py-2">
            Settings
          </Link>
          <a href="/api/admin/export" className="rounded border px-3 py-2">
            Export CSV
          </a>
          <form action="/api/admin/logout" method="post">
            <button className="rounded bg-slate-800 px-3 py-2 text-white">Logout</button>
          </form>
        </div>
      </div>

      <form className="mt-4 grid gap-2 rounded bg-white p-3 shadow md:grid-cols-4">
        <select name="status" defaultValue={searchParams.status || 'ALL'} className="rounded border p-2">
          <option value="ALL">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input type="date" name="from" defaultValue={searchParams.from} className="rounded border p-2" />
        <input type="date" name="to" defaultValue={searchParams.to} className="rounded border p-2" />
        <button className="rounded bg-brand-600 text-white">Apply</button>
      </form>

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
                <td className="p-2">{lead.createdAt.toLocaleDateString()}</td>
                <td className="p-2">
                  <Link className="text-brand-700 underline" href={`/admin/leads/${lead.id}`}>
                    {lead.name}
                  </Link>
                </td>
                <td className="p-2">{lead.serviceType}</td>
                <td className="p-2">{lead.status}</td>
                <td className="p-2">{lead.client.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}