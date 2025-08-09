import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campus = url.searchParams.get("campus") ?? undefined;
    const scope = (url.searchParams.get("scope") ?? "global") as "global" | "friends";
    const type = (url.searchParams.get("type") ?? "reviewers") as "reviewers" | "cafes";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20", 10), 100);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes } = await supabase.auth.getUser();
    const authedUser = userRes.user || null;

    if (scope === "friends" && !authedUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "reviewers") {
      // Get base leaderboard of users
      let query = supabase
        .from("user_stats")
        .select(
          `user_id, reviews_count, photos_count,
           users!inner(id, username, avatar_url, college)`
        );

      if (campus) {
        query = query.eq("users.college", campus);
      }

      if (scope === "friends" && authedUser) {
        const { data: follows, error: fErr } = await supabase
          .from("follows")
          .select("followee_id")
          .eq("follower_id", authedUser.id);
        if (fErr) throw fErr;
        const ids = (follows || []).map((f: any) => f.followee_id);
        if (ids.length === 0) {
          return new Response(JSON.stringify({ data: [], page, pageSize, total: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        query = query.in("user_id", ids);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Compute score and sort/paginate in-memory for MVP
      const enriched = (data || []).map((r: any) => ({
        user_id: r.user_id,
        reviews_count: r.reviews_count || 0,
        photos_count: r.photos_count || 0,
        score: (r.reviews_count || 0) + 0.5 * (r.photos_count || 0),
        user: r.users,
      }));
      enriched.sort((a: any, b: any) => b.score - a.score);
      const total = enriched.length;
      const start = (page - 1) * pageSize;
      const slice = enriched.slice(start, start + pageSize).map((row: any, idx: number) => ({
        rank: start + idx + 1,
        ...row,
      }));

      return new Response(JSON.stringify({ data: slice, page, pageSize, total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Cafes leaderboard
    // Aggregate avg rating and review count per cafe
    let base = supabase
      .from("reviews")
      .select(
        `cafe_id, avg:avg(rating), reviews_count:count(), cafes!inner(id, name, campus, google_place_id)`
      )
      .group("cafe_id, cafes(id, name, campus, google_place_id)");

    if (campus) {
      base = base.eq("cafes.campus", campus);
    }

    if (scope === "friends" && authedUser) {
      const { data: follows, error: fErr } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", authedUser.id);
      if (fErr) throw fErr;
      const ids = (follows || []).map((f: any) => f.followee_id);
      if (ids.length === 0) {
        return new Response(JSON.stringify({ data: [], page, pageSize, total: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      base = base.in("user_id", ids);
    }

    const { data, error } = await base;
    if (error) throw error;

    const rows = (data || []).map((r: any) => ({
      id: r.cafes?.id || r.cafe_id,
      name: r.cafes?.name,
      campus: r.cafes?.campus,
      google_place_id: r.cafes?.google_place_id,
      avg_rating: Number(r.avg || 0).toFixed(1),
      reviews_count: r.reviews_count || 0,
    }));
    rows.sort((a: any, b: any) => b.reviews_count - a.reviews_count || Number(b.avg_rating) - Number(a.avg_rating));
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const slice = rows.slice(start, start + pageSize).map((row: any, idx: number) => ({
      rank: start + idx + 1,
      ...row,
    }));

    return new Response(JSON.stringify({ data: slice, page, pageSize, total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[LEADERBOARD] Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});