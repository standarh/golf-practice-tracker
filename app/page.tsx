import { supabase } from "../lib/supabaseClient";
import AuthPanel from "./components/AuthPanel";
import NewSessionForm from "./components/NewSessionForm";
import StatsDashboard from "./components/StatsDashboard";
import SessionList from "./components/SessionList";

export default async function Home() {
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("session_date", { ascending: false });

  if (error) {
    console.error("Supabase error:", error.message);
  }

  const safeSessions = sessions ?? [];

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Golf Practice Sessions</h1>

      {/* Auth bar */}
      <AuthPanel />

      {/* Create new session */}
      <NewSessionForm />

      {/* Stats + chart */}
      <StatsDashboard sessions={safeSessions as any[]} />

      {/* Editable/deletable list */}
      <SessionList sessions={safeSessions as any[]} />
    </main>
  );
}
