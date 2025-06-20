import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { loadAuthSession, signOut as authSignOut, getCurrentUser, refreshSession } from '../utils/auth';

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
        console.log('Checking authentication state...');
        const session = loadAuthSession();
        
        if (session) {
          console.log('Valid session found:', session.user.email);
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          console.log('No valid session found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to load authentication state'
        });
      }
    };

    checkAuth();

    // Set up periodic session refresh
    const refreshInterval = setInterval(() => {
      const isValid = refreshSession();
      if (!isValid) {
        // Session expired, update state
        const currentSession = loadAuthSession();
        if (!currentSession && authState.isAuthenticated) {
          console.log('Session expired, logging out');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const signIn = (user: User) => {
    console.log('Setting user in auth state:', user.email);
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  };

  const signOut = () => {
    console.log('Signing out user');
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