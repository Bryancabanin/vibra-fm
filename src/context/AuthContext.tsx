import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../config.ts';

// Define shape of context

interface User {
  spotify_id: string;
  display_name: string | null;
}

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: User | null;
  logout: () => Promise<void>;
}

// create the conext with a default value
export const AuthContext = createContext<AuthContextType | null>(null);

// The provider - holds state and logic, wraps our app

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // checks if user is logged in when app loads

    // fetch('/api/auth/me', { credentials: 'include' })
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          return res.json() as Promise<User>;
        }
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setIsLoggedIn(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setIsLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      // await fetch('/api/auth/logout', { credentials: 'include' });
      await fetch(`${API_URL}/api/auth/logout`, { credentials: 'include' });
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Failed logging out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
