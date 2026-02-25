import { headers } from 'next/headers';
import { prisma } from './prisma';

export async function resolveClient(searchParams?: { [key: string]: string | string[] | undefined }) {
  const headerStore = headers();
  const host = headerStore.get('host')?.split(':')[0] ?? '';
  const clientFromParam = typeof searchParams?.client === 'string' ? searchParams.client : undefined;

  const byHost = host ? await prisma.client.findUnique({ where: { hostname: host } }) : null;
  if (byHost) return byHost;

  if (clientFromParam) {
    const byParam = await prisma.client.findUnique({ where: { slug: clientFromParam } });
    if (byParam) return byParam;
  }

  return prisma.client.findFirst({ orderBy: { createdAt: 'asc' } });
}
