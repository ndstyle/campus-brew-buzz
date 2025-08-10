import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const method = req.method;

    // Support both query param (?id=) and JSON body { id }
    let id = url.searchParams.get("id");
    let body: any = null;
    if (method !== "GET") {
      try {
        body = await req.json();
      } catch (_) {
        body = null;
      }
      if (!id && body?.id) id = String(body.id);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });

    // Handle profile update via POST { action: 'update', update: { username?, avatar_url?, full_name? } }
    if (method === "POST" && body?.action === "update") {
      const { data: userRes } = await supabase.auth.getUser();
      const authedUser = userRes?.user;
      if (!authedUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Ensure only self-update
      const targetId = id || authedUser.id;
      if (targetId !== authedUser.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const update: any = {};
      if (typeof body.update?.username === 'string') update.username = body.update.username.trim();
      if (typeof body.update?.avatar_url === 'string') update.avatar_url = body.update.avatar_url.trim();
      if (typeof body.update?.full_name === 'string') update.full_name = body.update.full_name.trim();

      if (Object.keys(update).length === 0) {
        return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: updated, error: upErr } = await supabase
        .from("users")
        .update(update)
        .eq("id", authedUser.id)
        .select("id, username, full_name, avatar_url, college, created_at")
        .maybeSingle();
      if (upErr) {
        return new Response(JSON.stringify({ error: upErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ user: updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default: fetch profile details
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: user, error: uErr } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url, college, created_at")
      .eq("id", id)
      .maybeSingle();
    if (uErr) throw uErr;
    if (!user) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: stats } = await supabase
      .from("user_stats")
      .select("reviews_count, photos_count, rank_position")
      .eq("user_id", id)
      .maybeSingle();

    const { data: recent } = await supabase
      .from("reviews")
      .select("id, rating, blurb, created_at, cafes(id, name, google_place_id)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({
      user,
      stats: stats || { reviews_count: 0, photos_count: 0, rank_position: null },
      recent: (recent || []).map((r: any) => ({ id: r.id, rating: r.rating, blurb: r.blurb, created_at: r.created_at, cafe: r.cafes })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[PROFILE] Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});