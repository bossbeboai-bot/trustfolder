import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { getCustomerProfileById } from '@/lib/customer-data';
import { Card, PageHeader, SectionTitle } from '../primitives';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — TrustFolder dashboard' };

export default async function SettingsPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');
  const profile = await getCustomerProfileById(session.customer_id);
  if (!profile) redirect('/login');

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account settings."
        description="Update your display name, company, and notification preference. Email is the verified address used for sign-in and can't be changed here yet."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle>Profile</SectionTitle>
          <SettingsForm
            initial={{
              email: profile.email,
              display_name: profile.display_name ?? '',
              company_name: profile.company_name ?? '',
              website_url: profile.website_url ?? '',
              notification_opt_in: profile.notification_opt_in,
            }}
          />
        </Card>

        <Card>
          <SectionTitle>Data</SectionTitle>
          <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] text-[var(--tf-ink)]">
            Export or delete your data
          </h3>
          <p className="mt-3 text-[14px] leading-[1.6] text-[var(--tf-slate)]">
            Email{' '}
            <a
              href="mailto:hello@trustfolder.io"
              className="text-[var(--tf-accent)] underline-offset-4 hover:underline"
            >
              hello@trustfolder.io
            </a>{' '}
            from this verified address to request a copy of your data or to delete your account.
            We reply within one business day.
          </p>
          <p className="mt-6 text-[12px] leading-[1.6] text-[var(--tf-slate-soft)]">
            TrustFolder prepares AI-generated governance evidence drafts for review. It is not
            legal advice, certification, or a compliance guarantee.
          </p>
        </Card>
      </div>
    </>
  );
}
