import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// custom hook - how component acess the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
