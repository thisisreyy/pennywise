import { User, AuthState } from '../types';

const AUTH_STORAGE_KEY = 'pennywise_auth';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  rememberMe: boolean;
  createdAt: number;
}

// Simple password hashing (in production, use bcrypt on backend)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'pennywise_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a simple token
const generateToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Load users from localStorage (simulating a database)
const loadUsers = (): Record<string, { id: string; email: string; passwordHash: string; createdAt: string }> => {
  try {
    const data = localStorage.getItem('pennywise_users');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Save users to localStorage
const saveUsers = (users: Record<string, any>): void => {
  try {
    localStorage.setItem('pennywise_users', JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

// Load auth session with better error handling and debugging
export const loadAuthSession = (): AuthSession | null => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) {
      console.log('No auth session found in localStorage');
      return null;
    }

    const session: AuthSession = JSON.parse(data);
    const now = Date.now();
    
    console.log('Session check:', {
      hasSession: !!session,
      expiresAt: new Date(session.expiresAt).toLocaleString(),
      now: new Date(now).toLocaleString(),
      isExpired: now > session.expiresAt,
      rememberMe: session.rememberMe,
      timeRemaining: Math.round((session.expiresAt - now) / (1000 * 60 * 60)) + ' hours'
    });
    
    // Check if session is expired
    if (now > session.expiresAt) {
      console.log('Session expired, removing from storage');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    // Extend session if it's close to expiring and rememberMe is true
    if (session.rememberMe && (session.expiresAt - now) < (24 * 60 * 60 * 1000)) {
      console.log('Extending session for remember me user');
      session.expiresAt = now + SESSION_DURATION;
      saveAuthSession(session);
    }

    return session;
  } catch (error) {
    console.error('Error loading auth session:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

// Save auth session with better error handling
const saveAuthSession = (session: AuthSession): void => {
  try {
    const sessionData = JSON.stringify(session);
    localStorage.setItem(AUTH_STORAGE_KEY, sessionData);
    console.log('Session saved:', {
      userId: session.user.id,
      expiresAt: new Date(session.expiresAt).toLocaleString(),
      rememberMe: session.rememberMe,
      token: session.token.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Failed to save auth session:', error);
  }
};

// Clear auth session
export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  console.log('Auth session cleared');
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sign up user
export const signUp = async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const { email, password, confirmPassword } = credentials;

    // Validate email
    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] };
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const users = loadUsers();
    
    // Check if user already exists
    if (Object.values(users).some(user => user.email === email)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const userId = Date.now().toString();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email,
      passwordHash,
      createdAt: now
    };

    users[userId] = newUser;
    saveUsers(users);

    const user: User = {
      id: userId,
      email,
      createdAt: now,
      lastLogin: now
    };

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
};

// Sign in user with improved session handling
export const signIn = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; session?: AuthSession }> => {
  try {
    const { email, password, rememberMe = false } = credentials;

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password' };
    }

    const users = loadUsers();
    const user = Object.values(users).find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    const now = new Date().toISOString();
    user.lastLogin = now;
    users[user.id] = user;
    saveUsers(users);

    // Create session with proper duration
    const sessionDuration = rememberMe ? SESSION_DURATION : 24 * 60 * 60 * 1000; // 7 days vs 24 hours
    const currentTime = Date.now();
    
    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: now
      },
      token: generateToken(),
      expiresAt: currentTime + sessionDuration,
      rememberMe,
      createdAt: currentTime
    };

    saveAuthSession(session);

    console.log('User signed in:', {
      email: user.email,
      rememberMe,
      sessionDuration: rememberMe ? '7 days' : '24 hours',
      expiresAt: new Date(session.expiresAt).toLocaleString()
    });

    return { success: true, session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in. Please try again.' };
  }
};

// Sign out user
export const signOut = (): void => {
  clearAuthSession();
  console.log('User signed out');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = loadAuthSession();
  return session !== null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const session = loadAuthSession();
  return session?.user || null;
};

// Refresh session if needed (call this periodically)
export const refreshSession = (): boolean => {
  const session = loadAuthSession();
  if (!session) return false;

  const now = Date.now();
  const timeUntilExpiry = session.expiresAt - now;
  
  // If session expires in less than 1 hour and rememberMe is true, extend it
  if (session.rememberMe && timeUntilExpiry < (60 * 60 * 1000) && timeUntilExpiry > 0) {
    session.expiresAt = now + SESSION_DURATION;
    saveAuthSession(session);
    console.log('Session refreshed');
    return true;
  }
  
  return timeUntilExpiry > 0;
};