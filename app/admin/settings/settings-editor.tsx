'use client';

import { useMemo, useState } from 'react';

export function SettingsEditor({
  client,
  action
}: {
  client: {
    id: string;
    slug: string;
    name: string;
    phone: string;
    emailRecipients: string;
    serviceArea: string;
    logoUrl: string | null;
    stripePaymentLink: string | null;
    notifyByEmail: boolean;
    notifyBySms: boolean;
    landingConfigJson: string;
  };
  action: (formData: FormData) => void;
}) {
  const [json, setJson] = useState(client.landingConfigJson);
  const preview = useMemo(() => {
    try {
      return { ok: true, data: JSON.parse(json) } as const;
    } catch {
      return { ok: false, data: null } as const;
    }
  }, [json]);

  return (
    <>
      <form action={action} className="mt-4 space-y-4 rounded bg-white p-4 shadow">
        <input type="hidden" name="clientId" value={client.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={client.name} className="rounded border p-2" placeholder="Business name" />
          <input name="phone" defaultValue={client.phone} className="rounded border p-2" placeholder="Business phone" />
          <input name="emailRecipients" defaultValue={client.emailRecipients} className="rounded border p-2" placeholder="Email recipients" />
          <input name="serviceArea" defaultValue={client.serviceArea} className="rounded border p-2" placeholder="Service area" />
          <input name="logoUrl" defaultValue={client.logoUrl || ''} className="rounded border p-2" placeholder="Logo URL" />
          <input name="stripePaymentLink" defaultValue={client.stripePaymentLink || ''} className="rounded border p-2" placeholder="Stripe payment link" />
        </div>
        <div className="flex gap-4">
          <label><input type="checkbox" name="notifyByEmail" defaultChecked={client.notifyByEmail} /> Email notifications</label>
          <label><input type="checkbox" name="notifyBySms" defaultChecked={client.notifyBySms} /> SMS notifications</label>
        </div>
        <label className="block font-semibold">Landing page JSON</label>
        <textarea name="landingConfigJson" value={json} onChange={(e) => setJson(e.target.value)} rows={18} className="w-full rounded border p-2 font-mono text-sm" />
        <button className="rounded bg-brand-600 px-4 py-2 text-white">Save settings</button>
      </form>
      <div className="mt-4 rounded bg-white p-4 shadow">
        <h2 className="font-semibold">Live Preview</h2>
        {preview.ok ? (
          <div className="mt-2 space-y-1 text-sm">
            <p><strong>Headline:</strong> {preview.data.hero?.headline}</p>
            <p><strong>CTA:</strong> {preview.data.hero?.ctaText}</p>
            <p><strong>Services:</strong> {preview.data.services?.length ?? 0}</p>
            <a className="text-brand-700 underline" href={`/?client=${client.slug}`} target="_blank">Open full landing preview</a>
          </div>
        ) : (
          <p className="mt-2 text-sm text-red-600">Invalid JSON. Fix formatting to preview/save.</p>
        )}
      </div>
    </>
  );
}
