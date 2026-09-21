import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isPasswordRecovery: false,
  setIsPasswordRecovery: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    let urlListener: { remove: () => void } | undefined;
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async ({ url }) => {
        if (url.startsWith('com.quadrantlife.app://login-callback') || url.startsWith('com.quadrantlife.app://reset-password')) {
          try {
            await Browser.close();
          } catch (e) {
            // In-app browser might already be closed
          }

          if (url.includes('reset-password') || url.includes('type=recovery')) {
            setIsPasswordRecovery(true);
          }

          try {
            // Extract authorization code from query parameters for PKCE flow
            const codeMatch = url.match(/[?&]code=([^&]+)/);
            if (codeMatch && codeMatch[1]) {
              const code = decodeURIComponent(codeMatch[1]);
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) {
                console.error('Error exchanging code for session:', error);
              } else if (data?.session) {
                setSession(data.session);
                setUser(data.session.user);
              }
            } else {
              // Fallback for implicit flow (access_token in fragment/query)
              const accessMatch = url.match(/[#?&]access_token=([^&]+)/);
              const refreshMatch = url.match(/[#?&]refresh_token=([^&]+)/);
              if (accessMatch && refreshMatch) {
                const access_token = decodeURIComponent(accessMatch[1]);
                const refresh_token = decodeURIComponent(refreshMatch[1]);
                const { data, error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (error) {
                  console.error('Error setting session:', error);
                } else if (data?.session) {
                  setSession(data.session);
                  setUser(data.session.user);
                }
              }
            }
          } catch (err) {
            console.error('Error handling OAuth callback URL:', err);
          }
        }
      }).then((handle) => {
        urlListener = handle;
      });
    }

    return () => {
      subscription.unsubscribe();
      urlListener?.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isPasswordRecovery, setIsPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
};
