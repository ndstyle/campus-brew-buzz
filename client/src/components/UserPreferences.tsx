import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Settings, X } from 'lucide-react';

const preferencesSchema = z.object({
  notifications: z.boolean(),
  preferred_cafes: z.array(z.string()).optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface UserPreference {
  id: string;
  user_id: string;
  notifications: boolean;
  preferred_cafes: string[] | null;
  created_at: string;
  updated_at: string;
}

export const UserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [userCafes, setUserCafes] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      notifications: true,
      preferred_cafes: [],
    },
  });

  // Fetch user's preferences and cafes they've reviewed
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setIsFetching(true);
      try {
        // For now, use localStorage for preferences since user_preferences table doesn't exist in Supabase
        const savedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
        let preferences = null;
        if (savedPreferences) {
          try {
            preferences = JSON.parse(savedPreferences);
          } catch (e) {
            console.error('Error parsing saved preferences:', e);
          }
        }

        // Fetch cafes the user has reviewed (for preferred cafes selection)
        const { data: reviewedCafes, error: cafesError } = await supabase
          .from('reviews')
          .select(`
            cafes!inner(id, name)
          `)
          .eq('user_id', user.id);

        if (cafesError) {
          console.error('Error fetching user cafes:', cafesError);
        } else {
          // Extract unique cafes
          const uniqueCafes = reviewedCafes?.reduce((acc, review) => {
            const cafe = (review as any).cafes;
            if (cafe && !acc.find(c => c.id === cafe.id)) {
              acc.push({ id: cafe.id, name: cafe.name });
            }
            return acc;
          }, [] as Array<{ id: string; name: string }>) || [];
          
          setUserCafes(uniqueCafes);
        }

        // Set form data
        if (preferences) {
          form.reset({
            notifications: preferences.notifications ?? true,
            preferred_cafes: preferences.preferred_cafes || [],
          });
        } else {
          // Set defaults if no preferences exist
          form.reset({
            notifications: true,
            preferred_cafes: [],
          });
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load preferences',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [user, form, toast]);

  const togglePreferredCafe = (cafeId: string) => {
    const currentPreferred = form.getValues('preferred_cafes') || [];
    const isCurrentlyPreferred = currentPreferred.includes(cafeId);
    
    if (isCurrentlyPreferred) {
      form.setValue('preferred_cafes', currentPreferred.filter(id => id !== cafeId));
    } else {
      form.setValue('preferred_cafes', [...currentPreferred, cafeId]);
    }
  };

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // For now, save to localStorage since user_preferences table doesn't exist in Supabase
      const preferencesToSave = {
        notifications: data.notifications,
        preferred_cafes: data.preferred_cafes || [],
        updated_at: new Date().toISOString(),
      };
      
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferencesToSave));

      toast({
        title: 'Success',
        description: 'Preferences saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Manage your notification settings and preferred cafes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const watchedPreferredCafes = form.watch('preferred_cafes') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Preferences
        </CardTitle>
        <CardDescription>
          Customize your experience with notification settings and preferred cafes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Notifications
                    </FormLabel>
                    <FormDescription>
                      Get notified about new reviews, friend activities, and app updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="switch-notifications"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium">Preferred Cafes</h4>
                <p className="text-sm text-muted-foreground">
                  Select cafes you want to see prioritized in your feed and recommendations
                </p>
              </div>

              {userCafes.length > 0 ? (
                <div className="space-y-3">
                  {userCafes.map((cafe) => {
                    const isPreferred = watchedPreferredCafes.includes(cafe.id);
                    return (
                      <div
                        key={cafe.id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => togglePreferredCafe(cafe.id)}
                        data-testid={`cafe-option-${cafe.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{cafe.name}</div>
                          {isPreferred && (
                            <Badge variant="secondary" className="text-xs">
                              Preferred
                            </Badge>
                          )}
                        </div>
                        {isPreferred && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePreferredCafe(cafe.id);
                            }}
                            data-testid={`remove-preferred-${cafe.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>You haven't reviewed any cafes yet.</p>
                  <p className="text-sm">Review some cafes to set your preferences!</p>
                </div>
              )}

              {watchedPreferredCafes.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    {watchedPreferredCafes.length} preferred cafe{watchedPreferredCafes.length === 1 ? '' : 's'} selected
                  </p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              data-testid="button-save-preferences"
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};