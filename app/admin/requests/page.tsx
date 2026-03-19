import { createClient } from "@/lib/supabase/server";

export default async function AdminRequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, description, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Demandes</h2>
        <p className="text-white/60">Toutes les demandes clients.</p>
      </div>

      <div className="grid gap-4">
        {requests?.length ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="border border-white/10 rounded-2xl p-4"
            >
              <h3 className="font-semibold">{req.title}</h3>
              <p className="text-white/60 text-sm mt-1">
                {req.description}
              </p>
              <p className="text-xs mt-2 text-white/40">
                Status: {req.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-white/50">Aucune demande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
