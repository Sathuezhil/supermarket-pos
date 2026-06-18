import { Navigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { canAccessRoute } from '../lib/roleAccess';

export function RoleRoute({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const { currentUser } = useApp();

  if (!canAccessRoute(currentUser.role, path)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
