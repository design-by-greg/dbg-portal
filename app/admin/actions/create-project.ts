"use server";

import { createClient } from "@/lib/supabase/server";

export async function createProjectFromRequest(requestId: string) {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) return;

  // créer projet
  await supabase.from("projects").insert({
    client_id: request.client_id,
    request_id: request.id,
    title: request.title,
    description: request.description,
    status: "in_progress",
  });

  // update request
  await supabase
    .from("requests")
    .update({ status: "converted" })
    .eq("id", request.id);
}
