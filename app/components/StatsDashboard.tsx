"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
};

type Props = {
  sessions: Session[];
};

const LAST_N_OPTIONS = [5, 10, 20, -1]; // -1 = all

export default function StatsDashboard({ sessions }: Props) {
  const [lastN, setLastN] = useState<number>(10);
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    if (locationFilter !== "all") {
      list = list.filter(
        (s) => s.location_type && s.location_type.toLowerCase() === locationFilter
      );
    }

    // sort oldest → newest for chart
    list.sort((a, b) => a.session_date.localeCompare(b.session_date));

    if (lastN !== -1 && list.length > lastN) {
      list = list.slice(list.length - lastN);
    }

    return list;
  }, [sessions, lastN, locationFilter]);

  const chartData = useMemo(
    () =>
      filteredSessions.map((s) => ({
        date: s.session_date,
        face: s.face_control_rating ?? null,
        contact: s.contact_rating ?? null,
        confidence: s.confidence_rating ?? null,
      })),
    [filteredSessions]
  );

  const summary = useMemo(() => {
    if (filteredSessions.length === 0) {
      return {
        avgFace: null,
        avgContact: null,
        avgConfidence: null,
        topMiss: null,
      };
    }

    let faceSum = 0;
    let faceCount = 0;
    let contactSum = 0;
    let contactCount = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;

    const missCounts: Record<string, number> = {};

    for (const s of filteredSessions) {
      if (typeof s.face_control_rating === "number") {
        faceSum += s.face_control_rating;
        faceCount++;
      }
      if (typeof s.contact_rating === "number") {
        contactSum += s.contact_rating;
        contactCount++;
      }
      if (typeof s.confidence_rating === "number") {
        confidenceSum += s.confidence_rating;
        confidenceCount++;
      }
      if (s.big_miss) {
        const key = s.big_miss.toLowerCase();
        missCounts[key] = (missCounts[key] || 0) + 1;
      }
    }

    const topMiss =
      Object.entries(missCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const formatAvg = (sum: number, count: number) =>
      count === 0 ? null : Number((sum / count).toFixed(2));

    return {
      avgFace: formatAvg(faceSum, faceCount),
      avgContact: formatAvg(contactSum, contactCount),
      avgConfidence: formatAvg(confidenceSum, confidenceCount),
      topMiss,
    };
  }, [filteredSessions]);

  return (
    <section className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Session stats</h2>
          <p className="text-xs text-gray-600">
            Based on your logged sessions (filters apply to both stats and chart).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border rounded px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="sim">Sim</option>
              <option value="range">Range</option>
              <option value="course">Course</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Sessions shown</label>
            <select
              value={lastN}
              onChange={(e) => setLastN(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs"
            >
              <option value={5}>Last 5</option>
              <option value={10}>Last 10</option>
              <option value={20}>Last 20</option>
              <option value={-1}>All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="border rounded p-2">
          <div className="text-xs text-gray-500">Avg face</div>
          <div className="text-lg font-semibold">
            {summary.avgFace ?? "–"}
          </div>
        </div>
        <div className="border rounded p-2">
          <div className="text-xs text-gray-500">Avg contact</div>
          <div className="text-lg font-semibold">
            {summary.avgContact ?? "–"}
          </div>
        </div>
        <div className="border rounded p-2">
          <div className="text-xs text-gray-500">Avg confidence</div>
          <div className="text-lg font-semibold">
            {summary.avgConfidence ?? "–"}
          </div>
        </div>
        <div className="border rounded p-2">
          <div className="text-xs text-gray-500">Most common miss</div>
          <div className="text-lg font-semibold capitalize">
            {summary.topMiss ?? "–"}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="h-64">
        {chartData.length === 0 ? (
          <p className="text-xs text-gray-600">
            Not enough data yet – log a few sessions to see your trends.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="face"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="contact"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
