"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function NewSessionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Capture form element before the await so it's not null later
    const form = e.currentTarget;
    const formData = new FormData(form);

    const session_date = formData.get("session_date") as string;
    const location_type = formData.get("location_type") as string;
    const clubs_focus = formData.get("clubs_focus") as string;
    const main_goal = formData.get("main_goal") as string;
    const big_miss = formData.get("big_miss") as string;
    const face_control_rating = Number(formData.get("face_control_rating"));
    const contact_rating = Number(formData.get("contact_rating"));
    const confidence_rating = Number(formData.get("confidence_rating"));
    const notes = formData.get("notes") as string;

    const { error } = await supabase.from("sessions").insert([
      {
        session_date,
        location_type,
        clubs_focus,
        main_goal,
        big_miss,
        face_control_rating,
        contact_rating,
        confidence_rating,
        notes,
      },
    ]);

    if (error) {
      console.error("Insert error:", error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    // Reset form and refresh list
    form.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 border rounded-lg p-4 bg-white shadow-sm"
    >
      <h2 className="text-lg font-semibold">Log a new session</h2>

      {error && (
        <p className="text-sm text-red-600">
          Something went wrong: {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="session_date"
            required
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location type
          </label>
          <select
            name="location_type"
            required
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">Select one</option>
            <option value="sim">Sim</option>
            <option value="range">Range</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Clubs focus</label>
        <input
          type="text"
          name="clubs_focus"
          placeholder="Driver, 7i, wedges…"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Main goal</label>
        <input
          type="text"
          name="main_goal"
          placeholder="Straighten it out, eliminate right miss…"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Big miss</label>
        <select
          name="big_miss"
          required
          className="w-full border rounded px-2 py-1 text-sm"
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Face (1–5)
          </label>
          <input
            type="number"
            name="face_control_rating"
            min={1}
            max={5}
            defaultValue={3}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contact (1–5)
          </label>
          <input
            type="number"
            name="contact_rating"
            min={1}
            max={5}
            defaultValue={3}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confidence (1–5)
          </label>
          <input
            type="number"
            name="confidence_rating"
            min={1}
            max={5}
            defaultValue={3}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Notes / feels
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Feels, drills, what worked or didn’t…"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-black text-white disabled:bg-gray-400"
      >
        {loading ? "Saving…" : "Save session"}
      </button>
    </form>
  );
}
