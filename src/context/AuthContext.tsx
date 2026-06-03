import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define shape of context

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
}

// create the conext with a default value
export const AuthContext = createContext<AuthContextType | null>(null);

// The provider - holds state and logic, wraps our app

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // checks if user is logged in when app loads

    fetch('http://127.0.0.1:8080/api/auth/me', { credentials: 'include' })
      .then((res) => {
        setIsLoggedIn(res.ok);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
