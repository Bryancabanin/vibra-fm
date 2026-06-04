import './App.css';
import { useAuth } from './hooks/useAuth';
import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import DiscoverPage from './pages/DiscoverPage';
import ProtectedRoute from './components/ProtectedRoute';

// Show loading state while auth is being checked
// handle routing -- shows thed right page based on the URL and auth state

function App() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
      {/* <Route path='/' element={<LoginPage />} /> */}
      <Route
        path='/'
        element={
          isLoggedIn ? <Navigate to='/discover' replace /> : <LoginPage />
        }
      />
      <Route
        path='/discover'
        element={
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
