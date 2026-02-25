import Image from 'next/image';
import { LandingConfig } from '@/lib/types';
import { QuoteForm } from './quote-form';

export function LandingPage({
  businessName,
  phone,
  serviceArea,
  stripePaymentLink,
  clientSlug,
  config
}: {
  businessName: string;
  phone: string;
  serviceArea: string;
  stripePaymentLink?: string | null;
  clientSlug: string;
  config: LandingConfig;
}) {
  return (
    <main>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <Image src={config.hero.backgroundImage} alt={businessName} fill className="object-cover opacity-30" priority />
        <div className="container-wrap relative grid gap-6 py-16 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold">{config.hero.headline}</h1>
            <p className="mt-3 text-lg text-slate-100">{config.hero.subheadline}</p>
            <div className="mt-5 flex gap-3">
              <a href="#quote-form" className="rounded bg-brand-600 px-4 py-2 font-semibold">{config.hero.ctaText}</a>
              {stripePaymentLink && (
                <a href={stripePaymentLink} className="rounded border border-white px-4 py-2 font-semibold">
                  Pay Deposit
                </a>
              )}
            </div>
            <p className="mt-4 text-sm">Call now: {phone}</p>
          </div>
          <QuoteForm clientSlug={clientSlug} />
        </div>
      </section>

      <section className="container-wrap py-12">
        <h2 className="text-2xl font-bold">Services</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {config.services.map((service) => (
            <article key={service.title} className="rounded-xl bg-white p-4 shadow">
              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-sm text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-wrap py-12">
        <h2 className="text-2xl font-bold">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {config.pricing.map((tier) => (
            <div key={tier.name} className="rounded-xl border bg-white p-4">
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="text-2xl font-bold text-brand-700">{tier.price}</p>
              <p className="text-sm text-slate-600">{tier.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wrap py-12">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {config.testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-xl bg-white p-4 shadow">
              “{item.quote}”
              <footer className="mt-2 text-sm font-semibold">— {item.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="container-wrap py-12">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-4 space-y-2">
          {config.faq.map((faq) => (
            <details key={faq.question} className="rounded bg-white p-3 shadow">
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="mt-2 text-sm text-slate-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-10 text-white">
        <div className="container-wrap">
          <h2 className="text-2xl font-bold">Service Area</h2>
          <p className="mt-2">{config.serviceAreaText}</p>
          <p className="mt-1 text-sm text-slate-300">{serviceArea}</p>
        </div>
      </section>

      <a href="#quote-form" className="fixed bottom-4 right-4 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg md:hidden">
        Get a Quote
      </a>
    </main>
  );
}
