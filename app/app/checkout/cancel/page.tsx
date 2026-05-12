import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout cancelled</h1>
      <p className="mt-3 text-[var(--tf-slate)]">
        No problem. Your answers are saved — you can come back any time.
      </p>
      <Link
        href="/assessment"
        className="mt-8 inline-flex items-center bg-[var(--tf-ink)] text-[var(--tf-on-light)] px-5 py-3 rounded-md font-medium hover:bg-[var(--tf-ink-soft)] transition"
      >
        Start over
      </Link>
    </div>
  );
}
