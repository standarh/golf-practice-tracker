"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Session = {
  id: string;
  session_date: string;
  location_type: string | null;
  clubs_focus: string | null;
  main_goal: string | null;
  big_miss: string | null;
  face_control_rating: number | null;
  contact_rating: number | null;
  confidence_rating: number | null;
  notes: string | null;
};

type Props = {
  sessions: Session[];
};

export default function SessionList({ sessions }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Session>>({});

  function startEdit(session: Session) {
    setEditingId(session.id);
    setForm({
      main_goal: session.main_goal ?? "",
      big_miss: session.big_miss ?? "",
      face_control_rating: session.face_control_rating ?? 3,
      contact_rating: session.contact_rating ?? 3,
      confidence_rating: session.confidence_rating ?? 3,
      notes: session.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  function updateField<K extends keyof Session>(key: K, value: string) {
    if (
      key === "face_control_rating" ||
      key === "contact_rating" ||
      key === "confidence_rating"
    ) {
      const num = value === "" ? null : Number(value);
      setForm((prev) => ({ ...prev, [key]: num as any }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value as any }));
    }
  }

  async function saveEdit(id: string) {
    setLoadingId(id);
    const { main_goal, big_miss, face_control_rating, contact_rating, confidence_rating, notes } =
      form;

    const { error } = await supabase
      .from("sessions")
      .update({
        main_goal,
        big_miss,
        face_control_rating,
        contact_rating,
        confidence_rating,
        notes,
      })
      .eq("id", id);

    setLoadingId(null);

    if (error) {
      console.error("Update error:", error.message);
      alert("Could not save changes: " + error.message);
      return;
    }

    setEditingId(null);
    setForm({});
    router.refresh();
  }

  async function deleteSession(id: string) {
    const confirmed = window.confirm(
      "Delete this session? This cannot be undone."
    );
    if (!confirmed) return;

    setLoadingId(id);

    const { error } = await supabase.from("sessions").delete().eq("id", id);

    setLoadingId(null);

    if (error) {
      console.error("Delete error:", error.message);
      alert("Could not delete session: " + error.message);
      return;
    }

    router.refresh();
  }

  if (!sessions || sessions.length === 0) {
    return <p>No sessions logged yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {sessions.map((s) => {
        const isEditing = editingId === s.id;
        const isBusy = loadingId === s.id;

        return (
          <li
            key={s.id}
            className="border rounded-lg p-4 shadow-sm bg-white space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold mb-1">
                  {s.session_date} • {s.location_type?.toUpperCase()}
                </div>
                {s.clubs_focus && (
                  <div className="text-xs text-gray-600">
                    Clubs: {s.clubs_focus}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 text-xs">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => startEdit(s)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="px-2 py-1 border rounded text-red-600"
                      disabled={isBusy}
                    >
                      {isBusy ? "Deleting…" : "Delete"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => saveEdit(s.id)}
                      className="px-2 py-1 border rounded bg-black text-white"
                      disabled={isBusy}
                    >
                      {isBusy ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 border rounded"
                      disabled={isBusy}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content area */}
            {!isEditing ? (
              <>
                {s.main_goal && (
                  <div className="text-sm">
                    <strong>Goal:</strong> {s.main_goal}
                  </div>
                )}

                {s.big_miss && (
                  <div className="text-sm">
                    <strong>Big miss:</strong> {s.big_miss}
                  </div>
                )}

                <div className="text-sm mt-1">
                  Face / Contact / Confidence:{" "}
                  {s.face_control_rating ?? "-"} / {s.contact_rating ?? "-"} /{" "}
                  {s.confidence_rating ?? "-"}
                </div>

                {s.notes && (
                  <p className="text-sm text-gray-600 mt-2">{s.notes}</p>
                )}
              </>
            ) : (
              <div className="space-y-2 mt-2 text-sm">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Main goal
                  </label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={form.main_goal ?? ""}
                    onChange={(e) =>
                      updateField("main_goal", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Big miss
                  </label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={form.big_miss ?? ""}
                    onChange={(e) =>
                      updateField("big_miss", e.target.value)
                    }
                  >
                    <option value="">Select one</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="thin">Thin</option>
                    <option value="fat">Fat</option>
                    <option value="heel">Heel</option>
                    <option value="toe">Toe</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Face (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="border rounded px-2 py-1 w-full"
                      value={form.face_control_rating ?? ""}
                      onChange={(e) =>
                        updateField("face_control_rating", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Contact (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="border rounded px-2 py-1 w-full"
                      value={form.contact_rating ?? ""}
                      onChange={(e) =>
                        updateField("contact_rating", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Confidence (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="border rounded px-2 py-1 w-full"
                      value={form.confidence_rating ?? ""}
                      onChange={(e) =>
                        updateField("confidence_rating", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Notes / feels
                  </label>
                  <textarea
                    className="border rounded px-2 py-1 w-full"
                    rows={3}
                    value={form.notes ?? ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
