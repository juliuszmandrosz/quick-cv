import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface UseCurrentUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setError(error);
        } else {
          setUser(data.session?.user ?? null);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err as Error);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
}
