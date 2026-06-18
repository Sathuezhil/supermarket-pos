import type { UserRole } from '../types';

export const ALL_ROLES: UserRole[] = ['admin', 'manager', 'cashier'];
export const MANAGEMENT_ROLES: UserRole[] = ['admin', 'manager'];

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (role === 'cashier') {
    return path === '/' || path === '';
  }
  return true;
}

export function getAccessiblePaths(role: UserRole): string[] {
  if (role === 'cashier') return ['/'];
  return ['/', '/products', '/inventory', '/reports', '/users'];
}
