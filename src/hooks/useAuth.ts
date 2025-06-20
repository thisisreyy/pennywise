import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { loadAuthSession, signOut as authSignOut, getCurrentUser } from '../utils/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const session = loadAuthSession();
        if (session) {
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to load authentication state'
        });
      }
    };

    checkAuth();
  }, []);

  const signIn = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  };

  const signOut = () => {
    authSignOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signIn,
    signOut,
    clearError
  };
};