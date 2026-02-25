import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const file = path.join(process.cwd(), 'clients', 'default-detailing.json');
  const raw = JSON.parse(await fs.readFile(file, 'utf8'));
  await prisma.client.upsert({
    where: { slug: raw.slug },
    update: {
      hostname: raw.hostname,
      name: raw.name,
      niche: raw.niche,
      city: raw.city,
      phone: raw.phone,
      emailRecipients: raw.emailRecipients,
      serviceArea: raw.serviceArea,
      logoUrl: raw.logoUrl,
      stripePaymentLink: raw.stripePaymentLink,
      notifyByEmail: raw.notifyByEmail,
      notifyBySms: raw.notifyBySms,
      landingConfigJson: JSON.stringify(raw.landing)
    },
    create: {
      slug: raw.slug,
      hostname: raw.hostname,
      name: raw.name,
      niche: raw.niche,
      city: raw.city,
      phone: raw.phone,
      emailRecipients: raw.emailRecipients,
      serviceArea: raw.serviceArea,
      logoUrl: raw.logoUrl,
      stripePaymentLink: raw.stripePaymentLink,
      notifyByEmail: raw.notifyByEmail,
      notifyBySms: raw.notifyBySms,
      landingConfigJson: JSON.stringify(raw.landing)
    }
  });
}

main().finally(() => prisma.$disconnect());
