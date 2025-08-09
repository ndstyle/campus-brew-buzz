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
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });

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