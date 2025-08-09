import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserCampus } from "@/hooks/useUserCampus";

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<'reviewers' | 'cafes'>("reviewers");
  const [leaderboardType, setLeaderboardType] = useState<'friends' | 'global'>("friends");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      type: activeTab,
      scope: leaderboardType,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (campus) params.set("campus", campus);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`https://ewzybklijfcablgmkbyw.functions.supabase.co/leaderboard?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || res.statusText);
      }
      setItems(body.data || []);
      setTotal(body.total || 0);
    } catch (e: any) {
      setError(e.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };
  const { campus } = useUserCampus();

  // Data fetched from edge function at runtime
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, leaderboardType, page, campus]);

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4">
          {/* Page Title */}
          <h2 className="text-4xl font-bold mb-8">leaderboard</h2>

          {/* Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'reviewers' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('reviewers'); setPage(1); }}
                size="sm"
                className="rounded-full px-6"
              >
                Reviewers
              </Button>
              <Button
                variant={activeTab === 'cafes' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('cafes'); setPage(1); }}
                size="sm"
                className="rounded-full px-6"
              >
                Cafes
              </Button>
            </div>
          </div>

          {/* User Stats Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-gray-300 rounded-full flex flex-col items-center justify-center bg-background">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <div className="text-right">
                  <div className="text-lg font-semibold">Visited:</div>
                  <div className="text-lg font-semibold">Reviewed:</div>
                  <div className="text-lg font-semibold">Photos</div>
                </div>
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                <div className="text-right">
                  <div className="text-lg font-bold">5</div>
                  <div className="text-lg font-bold">4</div>
                  <div className="text-lg font-bold">3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Scope Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <Button
                variant={leaderboardType === 'friends' ? 'default' : 'outline'}
                onClick={() => { setLeaderboardType('friends'); setPage(1); }}
                size="sm"
                className="rounded-full px-6"
              >
                Friends
              </Button>
              <Button
                variant={leaderboardType === 'global' ? 'default' : 'outline'}
                onClick={() => { setLeaderboardType('global'); setPage(1); }}
                size="sm"
                className="rounded-full px-6"
              >
                Global
              </Button>
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-2">
            {loading && <div className="p-3 text-sm text-muted-foreground">Loading…</div>}
            {error && <div className="p-3 text-sm text-destructive">{error}</div>}
            {!loading && !error && items.map((row: any) => (
              <div key={`${activeTab}-${row.rank}-${row.user?.id || row.id}`} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-lg">{row.user?.avatar_url ? '🖼️' : '👤'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{activeTab === 'reviewers' ? `@${row.user?.username || 'user'}` : row.name}</span>
                    <span className="text-xs text-muted-foreground">#{row.rank} • {activeTab === 'reviewers' ? (row.user?.college || '-') : (Number(row.avg_rating).toFixed(1) + ' ⭐')}</span>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {activeTab === 'reviewers' ? row.score : row.reviews_count}
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <div className="text-sm text-muted-foreground">Page {page}</div>
              <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;