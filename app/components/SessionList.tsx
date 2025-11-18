"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Session = {
  id: number;
  session_date: string;
  notes: string | null;
  tags?: string[] | null;
};

export default function SessionList({ sessions }: { sessions: Session[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this session?")) return;

    setDeletingId(id);

    const { error } = await supabase.from("sessions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting session:", error.message);
    }

    setDeletingId(null);
    window.location.reload();
  };

  if (!sessions.length) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Sessions</h2>
        <p className="text-sm text-slate-500">
          No sessions yet. Log your first one to start seeing patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Recent Sessions</h2>
      <div className="space-y-3">
        {sessions.map((session) => {
          const dateLabel = session.session_date
            ? new Date(session.session_date).toLocaleDateString()
            : "No date";

          const tags = session.tags ?? [];

          return (
            <div
              key={session.id}
              className="card-surface rounded-xl border border-slate-300 bg-white p-3 sm:p-4 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{dateLabel}</div>
                  {session.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {session.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deletingId === session.id}
                  className="text-xs text-red-600 border border-red-200 rounded-full px-2 py-1 disabled:opacity-60"
                >
                  {deletingId === session.id ? "Deleting…" : "Delete"}
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
