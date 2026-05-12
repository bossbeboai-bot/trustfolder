import Link from 'next/link';

export default function OutOfScopePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Requires expert review</h1>
      <p className="mt-3 text-[var(--tf-slate)] leading-relaxed">
        Based on the information you shared, your product appears to operate in a regulated
        category (banking, healthcare, HR, biometric ID, children, credit, or law-enforcement)
        that needs specialized expert review beyond what our automated tool can safely do.
      </p>
      <p className="mt-3 text-[var(--tf-slate)] leading-relaxed">
        We&rsquo;d recommend reaching out to a specialized AI/regulatory lawyer in your
        jurisdiction. We&rsquo;re happy to share starting points if you reply to the email
        you should have received.
      </p>

      <div className="mt-8 p-4 bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-md text-sm text-[var(--tf-ink-soft)]">
        <p className="font-medium">No charge.</p>
        <p className="mt-1 text-[var(--tf-slate)]">
          If you think we got this wrong, just reply to our email — happy to take another look.
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center text-[var(--tf-ink-soft)] hover:text-[var(--tf-ink)]"
      >
        ← Back to home
      </Link>
    </div>
  );
}
