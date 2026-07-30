import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LANDING } from '../constants/routes';

/**
 * PublicOnlyRoute - used for /login, /forgot-password, etc.
 * If already authenticated, bounce to the role-specific dashboard.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const target = ROLE_LANDING[user.role] || '/dashboard';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
