import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

function parseArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx > -1 ? process.argv[idx + 1] : undefined;
}

const name = parseArg('--name');
if (!name) {
  console.error('Usage: npm run new:client -- --name "ACME Detailing"');
  process.exit(1);
}

const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const clientJson = {
  slug,
  hostname: '',
  name,
  niche: 'mobile-detailing',
  city: 'Your City',
  phone: '(000) 000-0000',
  emailRecipients: process.env.NOTIFY_EMAIL_TO || 'owner@example.com',
  serviceArea: 'Your service area',
  logoUrl: '',
  stripePaymentLink: process.env.STRIPE_PAYMENT_LINK || '',
  notifyByEmail: true,
  notifyBySms: true,
  landing: {
    hero: {
      headline: `${name}: Fast Local Quotes`,
      subheadline: 'Book trusted local pros in minutes.',
      ctaText: 'Get Quote',
      backgroundImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1400&q=80'
    },
    services: [
      { title: 'Core Service #1', description: 'Describe your top service' },
      { title: 'Core Service #2', description: 'Describe your top service' },
      { title: 'Core Service #3', description: 'Describe your top service' }
    ],
    pricing: [
      { name: 'Starter', price: '$99', details: 'Entry package' },
      { name: 'Popular', price: '$179', details: 'Most booked package' },
      { name: 'Premium', price: '$299', details: 'Best value package' }
    ],
    testimonials: [
      { name: 'Happy Customer', quote: 'Amazing service and communication.' },
      { name: 'Local Owner', quote: 'Would absolutely hire again.' }
    ],
    faq: [
      { question: 'How fast can I book?', answer: 'Typically same day or next day.' },
      { question: 'Are you insured?', answer: 'Yes, fully insured and professional.' }
    ],
    serviceAreaText: 'Update this with your real local service area.'
  }
};

const filePath = path.join(process.cwd(), 'clients', `${slug}.json`);
await fs.writeFile(filePath, JSON.stringify(clientJson, null, 2));

const prisma = new PrismaClient();
await prisma.client.upsert({
  where: { slug },
  update: {
    name,
    niche: clientJson.niche,
    city: clientJson.city,
    phone: clientJson.phone,
    emailRecipients: clientJson.emailRecipients,
    serviceArea: clientJson.serviceArea,
    logoUrl: clientJson.logoUrl,
    stripePaymentLink: clientJson.stripePaymentLink,
    notifyByEmail: clientJson.notifyByEmail,
    notifyBySms: clientJson.notifyBySms,
    landingConfigJson: JSON.stringify(clientJson.landing)
  },
  create: {
    slug,
    hostname: clientJson.hostname || null,
    name,
    niche: clientJson.niche,
    city: clientJson.city,
    phone: clientJson.phone,
    emailRecipients: clientJson.emailRecipients,
    serviceArea: clientJson.serviceArea,
    logoUrl: clientJson.logoUrl,
    stripePaymentLink: clientJson.stripePaymentLink,
    notifyByEmail: clientJson.notifyByEmail,
    notifyBySms: clientJson.notifyBySms,
    landingConfigJson: JSON.stringify(clientJson.landing)
  }
});
await prisma.$disconnect();

console.log(`\n✅ Created client config: clients/${slug}.json`);
console.log('✅ Seeded/updated database settings for this client.');
console.log('\nNext steps checklist:');
console.log('1) Fill env vars: DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET, RESEND_*, TWILIO_*');
console.log(`2) Assign hostname mapping by setting hostname in clients/${slug}.json and in DB Settings UI.`);
console.log('3) Deploy to Vercel and set APP_URL + env vars.');
console.log(`4) Preview with /?client=${slug} until DNS is live.`);
