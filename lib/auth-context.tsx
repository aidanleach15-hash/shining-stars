'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guest_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Clear guest mode if user logs in
      if (user) {
        setIsGuest(false);
        localStorage.removeItem('guest_mode');
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Clear guest mode on login
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    // Clear guest mode on signup
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  const logout = async () => {
    await signOut(auth);
    // Clear guest state on logout
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('guest_mode', 'true');
  };

  const updateUsername = async (username: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: username
      });
      // Trigger a state update to reflect the change
      setUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, signup, logout, updateUsername, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
