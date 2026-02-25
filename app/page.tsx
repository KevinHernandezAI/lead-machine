export const dynamic = 'force-dynamic';
import { LandingPage } from '@/components/landing-page';
import { resolveClient } from '@/lib/client';
import { landingConfigSchema } from '@/lib/types';

export default async function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const client = await resolveClient(searchParams);

  if (!client) {
    return <main className="container-wrap py-24">No client configured yet. Run seed/new:client first.</main>;
  }

  const config = landingConfigSchema.parse(JSON.parse(client.landingConfigJson));

  return (
    <LandingPage
      businessName={client.name}
      phone={client.phone}
      serviceArea={client.serviceArea}
      stripePaymentLink={client.stripePaymentLink}
      clientSlug={client.slug}
      config={config}
    />
  );
}
