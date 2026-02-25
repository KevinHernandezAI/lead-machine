'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { leadSchema } from '@/lib/types';
import { z } from 'zod';

type LeadInput = z.infer<typeof leadSchema>;

const fieldClass =
  'w-full rounded border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20';

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
    setStatus(null);

    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LeadInput;
        setError(key, { message: issue.message });
      });
      setStatus('Please fix the highlighted fields.');
      return;
    }

    const formData = new FormData();

    // ✅ Send values reliably (don’t drop empty strings or dates)
    Object.entries(parsed.data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;

      // If Zod preprocess turned preferredDate into a Date, send as YYYY-MM-DD
      if (v instanceof Date) {
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, '0');
        const dd = String(v.getDate()).padStart(2, '0');
        formData.append(k, `${yyyy}-${mm}-${dd}`);
        return;
      }

      formData.append(k, String(v));
    });

    const file = event?.target?.photo?.files?.[0];
    if (file) formData.append('photo', file);

    formData.append('clientSlug', clientSlug);

    const response = await fetch('/api/quote', { method: 'POST', body: formData });

    // ✅ Show the REAL error from the server (so we can fix the exact cause)
    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      try {
        const j = await response.json();
        if (j?.where === 'leadSchema' && j?.error) {
          msg = JSON.stringify(j.error, null, 2);
        } else if (j?.error) {
          msg = typeof j.error === 'string' ? j.error : JSON.stringify(j.error, null, 2);
        } else {
          msg = JSON.stringify(j, null, 2);
        }
      } catch {
        // ignore json parse errors
      }
      setStatus(msg);
      return;
    }

    setStatus('Thanks! Your quote request was sent.');
    reset();
  };

  return (
    <form id="quote-form" className="space-y-3 rounded-2xl bg-white p-4 shadow" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-xl font-semibold text-slate-900">Get a Quote</h3>

      <input className={fieldClass} placeholder="Full name" {...register('name')} />
      {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}

      <input className={fieldClass} placeholder="Phone" {...register('phone')} />
      {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}

      <input className={fieldClass} placeholder="Email (optional)" {...register('email')} />

      <select className={fieldClass} defaultValue="" {...register('serviceType')}>
        <option value="" disabled>
          Service type
        </option>
        <option value="Interior Deep Clean">Interior Deep Clean</option>
        <option value="Exterior Wash & Wax">Exterior Wash & Wax</option>
        <option value="Full Detail">Full Detail</option>
        <option value="Other">Other</option>
      </select>
      {errors.serviceType && <p className="text-sm text-red-600">{errors.serviceType.message}</p>}

      <input className={fieldClass} placeholder="Address or ZIP" {...register('address')} />

      <input className={fieldClass} type="date" {...register('preferredDate')} />

      <textarea className={fieldClass} placeholder="Notes" {...register('notes')} />

      <input
        name="photo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="w-full text-sm text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-900 hover:file:bg-slate-200"
      />

      <button disabled={isSubmitting} className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">
        {isSubmitting ? 'Submitting...' : 'Get Quote'}
      </button>

      {status && (
        <pre className="whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900">
          {status}
        </pre>
      )}
    </form>
  );
}