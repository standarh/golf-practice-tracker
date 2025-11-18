"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Session = {
  id: number;
  session_date: string;
  tags?: string[] | null;
};

// Keep this aligned with the tags you use in the form.
// It lets us reason about "under-practiced" areas even if count = 0.
const FOCUS_TAGS = [
  "Driver",
  "Fairway Woods",
  "Hybrids",
  "Long Irons",
  "Mid Irons",
  "Short Irons",
  "Wedges",
  "Putting",
  "Chipping",
  "Bunker",
  "Range",
  "Simulator",
  "On-Course",
  "Lesson",
  "Fitness / Mobility",
  "Mental Game",
  "Notes / Review",
];

export default function StatsDashboard({ sessions }: { sessions: Session[] }) {
  const {
    totalSessions,
    recentSessions,
    tagCounts,
    topTags,
    chartData,
    focusSuggestions,
  } = useMemo(() => {
    const now = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    let total = sessions.length;
    let recent = 0;
    const counts: Record<string, number> = {};

    for (const s of sessions) {
      if (s.session_date) {
        const d = new Date(s.session_date);
        if (now.getTime() - d.getTime() <= THIRTY_DAYS_MS) {
          recent += 1;
        }
      }

      const tags = s.tags ?? [];
      for (const tag of tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }

    const tagEntries = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );

    const topTags = tagEntries.slice(0, 3);

    const chartData = tagEntries.map(([tag, count]) => ({
      tag,
      count,
    }));

    // Build focus suggestions out of the full tag universe, not just those used.
    const focusBase = FOCUS_TAGS.map((tag) => ({
      tag,
      count: counts[tag] ?? 0,
    }));

    // Sort ascending: least-practiced first
    focusBase.sort((a, b) => a.count - b.count);

    // Take the first 3 as "areas to consider investing in"
    const focusSuggestions = focusBase.slice(0, 3);

    return {
      totalSessions: total,
      recentSessions: recent,
      tagCounts: counts,
      topTags,
      chartData,
      focusSuggestions,
    };
  }, [sessions]);

  const hasTagData = Object.keys(tagCounts).length > 0;

  return (
    <div className="space-y-4">
      {/* High-level KPIs */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[120px] rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
          <div className="text-xs text-slate-500">Total sessions</div>
          <div className="mt-1 text-xl font-semibold">{totalSessions}</div>
        </div>
        <div className="flex-1 min-w-[120px] rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
          <div className="text-xs text-slate-500">Last 30 days</div>
          <div className="mt-1 text-xl font-semibold">{recentSessions}</div>
        </div>
      </div>

      {/* Focus suggestions */}
      <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-sm space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Suggested focus areas
        </div>
        <p className="text-xs text-slate-500">
          Based on your logged sessions, these areas are seeing the least volume.
          If they matter for your scoring, consider dedicating focused reps here.
        </p>
        <ul className="space-y-1.5">
          {focusSuggestions.map(({ tag, count }) => (
            <li key={tag} className="flex items-center justify-between gap-2">
              <span className="text-sm">{tag}</span>
              <span className="text-[11px] text-slate-500">
                {count === 0
                  ? "No sessions yet"
                  : `${count} session${count === 1 ? "" : "s"} logged`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tag-based stats + chart */}
      {hasTagData ? (
        <>
          <div className="space-y-2">
            <div className="text-sm font-medium">Most practiced areas</div>
            <div className="flex flex-wrap gap-1.5">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-900 text-slate-50 px-2.5 py-0.5 text-[11px]"
                >
                  {tag}
                  <span className="ml-1 text-[10px] opacity-80">
                    ({count})
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20 }}>
                <XAxis
                  dataKey="tag"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  labelStyle={{ fontWeight: 500 }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          Once you start tagging sessions (Driver, Putting, Range, etc.), your
          most-practiced areas and tag breakdown will show up here.
        </p>
      )}
    </div>
  );
}
