import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, loading, error } = usePublicProfile(id);
  const isSelf = user?.id === id;

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!user?.id || !id || isSelf) return;
      const { data: rows, error: selErr } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followee_id", id)
        .limit(1);
      if (!selErr && rows && rows.length > 0) setIsFollowing(true);
    };
    checkFollowing();
  }, [user?.id, id, isSelf]);

  const toggleFollow = async () => {
    if (!id || !user?.id) return;
    setBusy(true);
    try {
      const action = isFollowing ? "unfollow" : "follow";
      const { data: _res, error: fnErr } = await supabase.functions.invoke("follow", {
        body: { action, followee_id: id },
      });
      if (fnErr) throw fnErr;
      setIsFollowing(!isFollowing);
      toast.success(action === "follow" ? "Followed" : "Unfollowed");
    } catch (e: any) {
      console.error("[FOLLOW] Error", e);
      toast.error(e?.message || "Failed to update follow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area px-4 py-4">
        <h1 className="text-xl font-bold mb-2">Profile</h1>
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && data?.user && (
          <>
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">{(data.user.username || "U").charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-2xl font-semibold">@{data.user.username || "user"}</div>
              <div className="text-sm text-muted-foreground">{data.user.college || "-"}</div>
              {!isSelf && (
                <div className="mt-4">
                  <Button disabled={busy} onClick={toggleFollow} className="rounded-full">
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="p-4 text-center">
                <div className="text-xs text-muted-foreground">Reviews</div>
                <div className="text-xl font-bold">{data.stats?.reviews_count ?? 0}</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-xs text-muted-foreground">Photos</div>
                <div className="text-xl font-bold">{data.stats?.photos_count ?? 0}</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-xs text-muted-foreground">Rank</div>
                <div className="text-xl font-bold">{data.stats?.rank_position ?? "-"}</div>
              </Card>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Recent reviews</h2>
              {(data.recent || []).map((r) => (
                <Card key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.cafe?.name || "Unknown Cafe"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold">
                    {Number(r.rating).toFixed(1)}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
