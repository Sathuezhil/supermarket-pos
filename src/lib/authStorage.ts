const CREDENTIALS_KEY = 'lanka_pos_credentials';
const SESSION_KEY = 'lanka_pos_session';

export interface LocalCredential {
  userId: string;
  username: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  loggedInAt: string;
}

export const DEFAULT_CREDENTIALS: LocalCredential[] = [
  { userId: 'u1', username: 'admin', password: 'admin123' },
  { userId: 'u2', username: 'manager1', password: 'manager123' },
  { userId: 'u3', username: 'cashier1', password: 'cashier123' },
  { userId: 'u4', username: 'cashier2', password: 'cashier123' },
];

function initCredentials(): void {
  if (!localStorage.getItem(CREDENTIALS_KEY)) {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
  }
}

export function getCredentials(): LocalCredential[] {
  initCredentials();
  return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '[]');
}

export function saveCredentials(credentials: LocalCredential[]): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function validateLogin(username: string, password: string): LocalCredential | null {
  const cred = getCredentials().find(
    (c) => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password,
  );
  return cred ?? null;
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function addCredential(credential: LocalCredential): void {
  const creds = getCredentials().filter(
    (c) => c.userId !== credential.userId && c.username !== credential.username,
  );
  saveCredentials([...creds, credential]);
}

export function updateCredentialForUser(userId: string, username: string, password?: string): void {
  const creds = getCredentials();
  const existing = creds.find((c) => c.userId === userId);
  if (existing) {
    addCredential({ userId, username, password: password ?? existing.password });
  } else {
    addCredential({ userId, username, password: password ?? 'password123' });
  }
}

export function removeCredential(userId: string): void {
  saveCredentials(getCredentials().filter((c) => c.userId !== userId));
}

export function getPasswordForUser(userId: string): string | undefined {
  return getCredentials().find((c) => c.userId === userId)?.password;
}
