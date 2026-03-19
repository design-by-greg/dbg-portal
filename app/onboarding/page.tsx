"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // récupérer le client lié
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) return;

    // créer une première demande
    await supabase.from("requests").insert({
      client_id: client.id,
      title: "Première demande",
      description,
      status: "pending",
    });

    // update client
    await supabase
      .from("clients")
      .update({
        company_name: company,
        onboarding_completed: true,
      })
      .eq("id", client.id);

    setLoading(false);

    router.push("/client");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-xl font-semibold mb-4">Bienvenue 👋</h1>
        <p className="text-sm text-gray-500 mb-6">
          Dis-nous ce dont tu as besoin pour commencer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Nom de ton entreprise"
            className="w-full border rounded-xl px-3 py-2"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <textarea
            placeholder="Explique ton besoin (t-shirt, stickers, etc...)"
            className="w-full border rounded-xl px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-xl"
          >
            {loading ? "Création..." : "Démarrer"}
          </button>
        </form>
      </div>
    </main>
  );
}
