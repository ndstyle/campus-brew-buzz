import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PublicProfileData {
  user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    college: string | null;
    created_at: string;
  } | null;
  stats: {
    reviews_count: number;
    photos_count: number;
    rank_position: number | null;
  } | null;
  recent: Array<{
    id: string;
    rating: number;
    blurb: string | null;
    created_at: string;
    cafe: { id: string; name: string; google_place_id: string } | null;
  }>;
}

export function usePublicProfile(userId?: string) {
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: res, error: fnErr } = await supabase.functions.invoke("profile", {
          body: { id: userId },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });
        if (fnErr) throw fnErr;
        setData(res as PublicProfileData);
      } catch (e: any) {
        console.error("[PROFILE] invoke error", e);
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [userId]);

  return { data, loading, error };
}
