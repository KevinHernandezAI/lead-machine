'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { leadSchema } from '@/lib/types';
import { z } from 'zod';

type LeadInput = z.infer<typeof leadSchema>;

export function QuoteForm({ clientSlug }: { clientSlug: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LeadInput>();

  const onSubmit = async (data: LeadInput, event?: React.BaseSyntheticEvent) => {
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LeadInput;
        setError(key, { message: issue.message });
      });
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
    const file = event?.target?.photo?.files?.[0];
    if (file) formData.append('photo', file);
    formData.append('clientSlug', clientSlug);

    const response = await fetch('/api/quote', { method: 'POST', body: formData });
    if (!response.ok) {
      setStatus('Something went wrong. Please call us directly.');
      return;
    }

    setStatus('Thanks! Your quote request was sent.');
    reset();
  };

  return (
    <form id="quote-form" className="space-y-3 rounded-2xl bg-white p-4 shadow" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-xl font-semibold">Get a Quote</h3>
      <input className="w-full rounded border p-2" placeholder="Full name" {...register('name')} />
      {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      <input className="w-full rounded border p-2" placeholder="Phone" {...register('phone')} />
      {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      <input className="w-full rounded border p-2" placeholder="Email (optional)" {...register('email')} />
      <input className="w-full rounded border p-2" placeholder="Service type" {...register('serviceType')} />
      {errors.serviceType && <p className="text-sm text-red-600">{errors.serviceType.message}</p>}
      <input className="w-full rounded border p-2" placeholder="Address or ZIP" {...register('address')} />
      <input className="w-full rounded border p-2" type="date" {...register('preferredDate')} />
      <textarea className="w-full rounded border p-2" placeholder="Notes" {...register('notes')} />
      <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" className="w-full text-sm" />
      <button disabled={isSubmitting} className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">
        {isSubmitting ? 'Submitting...' : 'Get Quote'}
      </button>
      {status && <p className="text-sm text-green-700">{status}</p>}
    </form>
  );
}
