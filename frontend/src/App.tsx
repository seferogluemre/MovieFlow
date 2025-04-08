import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './context/AuthContext';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const LoadingPage = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Require auth component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/movies" 
          element={
            <MainLayout>
              <Movies />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/movies/:id" 
          element={
            <MainLayout>
              <MovieDetail />
            </MainLayout>
          } 
        />
        
        <Route
          path="/genres/:id"
          element={
            <MainLayout>
              <Movies />
            </MainLayout>
          }
        />
        
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
