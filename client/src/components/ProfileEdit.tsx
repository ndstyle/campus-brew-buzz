import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, User } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  onSuccess?: () => void;
}

export const ProfileEdit = ({ onSuccess }: ProfileEditProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      setIsFetching(true);
      try {
        // Get data from both Supabase Auth and users table
        const authEmail = user.email || '';
        const authMetadata = user.user_metadata || {};
        
        // Fetch from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('username, first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
          throw error;
        }

        // Use data from users table or fallback to auth metadata
        const currentData = {
          username: userData?.username || authMetadata.username || '',
          first_name: userData?.first_name || authMetadata.first_name || '',
          last_name: userData?.last_name || authMetadata.last_name || '',
          email: userData?.email || authEmail,
        };

        form.reset(currentData);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Check if username is taken by another user
      if (data.username) {
        const { data: existingUser, error: usernameError } = await supabase
          .from('users')
          .select('id')
          .eq('username', data.username)
          .neq('id', user.id)
          .single();

        if (usernameError && usernameError.code !== 'PGRST116') {
          throw usernameError;
        }

        if (existingUser) {
          form.setError('username', {
            type: 'manual',
            message: 'Username is already taken',
          });
          return;
        }
      }

      // Update users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

      if (authError) {
        console.warn('Failed to update auth metadata:', authError);
        // Don't throw here as the main update succeeded
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Call onSuccess callback to close dialog
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
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
            <User className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="input-username"
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be your unique identifier on the platform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="input-first-name"
                      placeholder="Enter your first name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="input-last-name"
                      placeholder="Enter your last name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="input-email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Changing your email may require email verification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              data-testid="button-save-profile"
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
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};