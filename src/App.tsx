import './App.css';
import { useAuth } from './hooks/useAuth';
import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import DiscoverPage from './pages/DiscoverPage';
import HistoryPage from './pages/HistoryPage';
import HistorySessionPage from './pages/HistorySessionPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Show loading state while auth is being checked
// handle routing -- shows thed right page based on the URL and auth state

function App() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
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
            <Layout>
              <DiscoverPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/history'
        element={
          <ProtectedRoute>
            <Layout>
              <HistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/history/:sessionId'
        element={
          <ProtectedRoute>
            <Layout>
              <HistorySessionPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
