import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, contact_name, company_name, email, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Clients</h2>
        <p className="text-white/60">Retrouve ici tous les clients enregistrés.</p>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {clients?.length ? (
              clients.map((client) => (
                <tr key={client.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{client.contact_name || "—"}</td>
                  <td className="px-4 py-3">{client.company_name || "—"}</td>
                  <td className="px-4 py-3">{client.email || "—"}</td>
                  <td className="px-4 py-3">{client.status || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-white/50">
                  Aucun client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
