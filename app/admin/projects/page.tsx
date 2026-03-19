import { createClient } from "@/lib/supabase/server";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Projets</h2>
        <p className="text-white/60">Tous les projets créés depuis les demandes clients.</p>
      </div>

      <div className="grid gap-4">
        {projects?.length ? (
          projects.map((project) => (
            <div key={project.id} className="border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{project.title || "Projet sans titre"}</h3>
                  <p className="text-white/60 text-sm mt-1">{project.description || "—"}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-white/70">
                  {project.status || "new_project"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white/50">Aucun projet pour le moment.</p>
        )}
      </div>
    </div>
  );
}
