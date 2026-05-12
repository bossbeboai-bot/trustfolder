'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_lost';

const STATUSES: Status[] = ['new', 'contacted', 'qualified', 'converted', 'closed_lost'];

export default function RequestRowActions({
  id,
  initialStatus,
  initialNote,
}: {
  id: string;
  initialStatus: Status;
  initialNote: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [note, setNote] = useState<string>(initialNote);
  const [editingNote, setEditingNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patchRequest(patch: { status?: Status; internal_note?: string }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        let msg = `update_failed_${res.status}`;
        try {
          const j = (await res.json()) as { error?: string };
          msg = j.error ?? msg;
        } catch {
          /* ignore */
        }
        setError(msg === 'unauthorized' ? 'Session expired. Please sign in again.' : 'Could not save.');
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError('Network error.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onChangeStatus(next: Status) {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    const ok = await patchRequest({ status: next });
    if (!ok) setStatus(prev);
  }

  async function saveNote() {
    const ok = await patchRequest({ internal_note: note });
    if (ok) setEditingNote(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        onChange={(e) => void onChangeStatus(e.target.value as Status)}
        disabled={saving}
        className="h-8 min-w-[8.5rem] rounded-md border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-2 text-xs text-[var(--tf-ink)] outline-none transition focus:border-[var(--tf-accent)] disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            mark {s}
          </option>
        ))}
      </select>

      {editingNote ? (
        <div className="space-y-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Internal note (founder-only)…"
            className="w-44 resize-none rounded-md border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-2 py-1 text-xs leading-5 outline-none transition focus:border-[var(--tf-accent)]"
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => void saveNote()}
              disabled={saving}
              className="rounded-md border border-[var(--tf-border-strong)] bg-[var(--tf-ink)] px-2 py-0.5 text-[11px] font-medium text-[var(--tf-on-light)] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNote(initialNote);
                setEditingNote(false);
              }}
              disabled={saving}
              className="rounded-md border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-2 py-0.5 text-[11px] text-[var(--tf-ink)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditingNote(true)}
          className="rounded-md border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-2 py-1 text-[11px] text-[var(--tf-ink)] hover:bg-[var(--tf-bg-soft)]"
        >
          {note ? 'Edit note' : 'Add note'}
        </button>
      )}

      {error && <p className="text-[11px] text-[#7a1f1f]">{error}</p>}
    </div>
  );
}
