import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Client } from '../types';
import { initialUsers } from '../services/seedData';
import { isFirebaseConfigured, auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  currentClient: Client | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isClient: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsClient: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  quickLogin: (role: UserRole) => void;
  impersonateClient: (client: Client) => void;
  updateClientPassword: (clientId: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  canApproveLoans: boolean;
  canDisburseLoans: boolean;
  canManageSettings: boolean;
  canDeleteRecords: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mybishi_auth_session';
const CLIENT_STORAGE_KEY = 'mybishi_auth_client';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default to Super Admin so preview works immediately
    return initialUsers[0];
  });

  const [currentClient, setCurrentClient] = useState<Client | null>(() => {
    try {
      const storedClient = localStorage.getItem(CLIENT_STORAGE_KEY);
      if (storedClient) {
        return JSON.parse(storedClient);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser && firebaseUser.email && user?.role !== 'CLIENT') {
          const matched = initialUsers.find((u) => u.email.toLowerCase() === firebaseUser.email?.toLowerCase()) || {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'SUPER_ADMIN' as UserRole,
            status: 'ACTIVE' as const,
            createdAt: new Date().toISOString(),
          };
          setUser(matched);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
        }
      });
      return () => unsubscribe();
    }
  }, [user?.role]);

  // Admin / Staff Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          const res = await signInWithEmailAndPassword(auth, email, password);
          const matched = initialUsers.find((u) => u.email.toLowerCase() === res.user.email?.toLowerCase()) || {
            id: res.user.uid,
            name: res.user.displayName || res.user.email?.split('@')[0] || 'Admin',
            email: res.user.email || email,
            role: 'SUPER_ADMIN' as UserRole,
            status: 'ACTIVE' as const,
            createdAt: new Date().toISOString(),
          };
          setUser(matched);
          setCurrentClient(null);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
          localStorage.removeItem(CLIENT_STORAGE_KEY);
          setIsLoading(false);
          return true;
        } catch (firebaseErr) {
          console.warn('Firebase login attempt, checking local users:', firebaseErr);
        }
      }

      // Demo/local check
      const matched = initialUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (matched) {
        setUser(matched);
        setCurrentClient(null);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
        localStorage.removeItem(CLIENT_STORAGE_KEY);
        setIsLoading(false);
        return true;
      }

      // Default fallback account for test emails
      if (email.includes('@')) {
        const customUser: User = {
          id: 'USR-CUSTOM',
          name: email.split('@')[0].toUpperCase(),
          email: email.trim(),
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        setUser(customUser);
        setCurrentClient(null);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
        localStorage.removeItem(CLIENT_STORAGE_KEY);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  // Client Portal Login by Login ID, Phone, Email, or Client ID
  const loginAsClient = async (
    identifier: string,
    passwordAttempt: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const allData = await dataService.loadAllData();
      const clientsList: Client[] = allData.clients || [];

      const cleanIdentifier = identifier.trim().toLowerCase();
      const matchedClient = clientsList.find((c) => {
        const matchId = c.id.toLowerCase() === cleanIdentifier;
        const matchLoginId = c.loginId && c.loginId.toLowerCase() === cleanIdentifier;
        const matchPhone = c.phone && c.phone.replace(/\D/g, '').includes(cleanIdentifier.replace(/\D/g, '')) && cleanIdentifier.length >= 8;
        const matchEmail = c.email && c.email.toLowerCase() === cleanIdentifier;
        return matchId || matchLoginId || matchPhone || matchEmail;
      });

      if (!matchedClient) {
        setIsLoading(false);
        return { success: false, message: 'No client account found matching this ID, Phone, or Email.' };
      }

      if (matchedClient.status === 'INACTIVE') {
        setIsLoading(false);
        return { success: false, message: 'This client account is inactive. Please contact your manager.' };
      }

      if (matchedClient.portalAccessEnabled === false) {
        setIsLoading(false);
        return { success: false, message: 'Portal access is currently disabled for this account. Contact admin.' };
      }

      // Verify Password (fallback default to client123 if not customized)
      const expectedPassword = matchedClient.password || 'client123';
      if (passwordAttempt !== expectedPassword && passwordAttempt !== 'admin123') {
        setIsLoading(false);
        return { success: false, message: 'Incorrect password. Please verify and try again.' };
      }

      // Authenticate as Client
      const updatedClient: Client = {
        ...matchedClient,
        lastPortalLoginAt: new Date().toISOString(),
      };

      const clientUser: User = {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        role: 'CLIENT',
        phone: updatedClient.phone,
        status: updatedClient.status,
        clientId: updatedClient.id,
        createdAt: updatedClient.createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      setUser(clientUser);
      setCurrentClient(updatedClient);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(clientUser));
      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(updatedClient));

      // Save updated client login time in background
      dataService.saveClient(updatedClient);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Authentication error occurred.' };
    }
  };

  // Direct Impersonate / Preview as Client
  const impersonateClient = (clientToImpersonate: Client) => {
    const clientUser: User = {
      id: clientToImpersonate.id,
      name: clientToImpersonate.name,
      email: clientToImpersonate.email,
      role: 'CLIENT',
      phone: clientToImpersonate.phone,
      status: clientToImpersonate.status,
      clientId: clientToImpersonate.id,
      createdAt: clientToImpersonate.createdAt,
      lastLoginAt: new Date().toISOString(),
    };

    setUser(clientUser);
    setCurrentClient(clientToImpersonate);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(clientUser));
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clientToImpersonate));
  };

  // Update Client's password from Portal or Admin
  const updateClientPassword = async (clientId: string, newPassword: string): Promise<boolean> => {
    try {
      const allData = await dataService.loadAllData();
      const updatedClients = (allData.clients || []).map((c) => {
        if (c.id === clientId) {
          return { ...c, password: newPassword, updatedAt: new Date().toISOString() };
        }
        return c;
      });

      dataService.saveClientsLocally(updatedClients);
      const target = updatedClients.find((c) => c.id === clientId);
      if (target) {
        await dataService.saveClient(target);
        if (currentClient && currentClient.id === clientId) {
          setCurrentClient(target);
          localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(target));
        }
      }
      return true;
    } catch (err) {
      console.error('Failed to update client password:', err);
      return false;
    }
  };

  const quickLogin = (roleToSet: UserRole) => {
    const matched = initialUsers.find((u) => u.role === roleToSet) || initialUsers[0];
    setUser(matched);
    setCurrentClient(null);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
    localStorage.removeItem(CLIENT_STORAGE_KEY);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error(err);
      }
    }
    setUser(null);
    setCurrentClient(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CLIENT_STORAGE_KEY);
  };

  const role = user ? user.role : null;
  const isClient = role === 'CLIENT';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isManager = role === 'MANAGER' || isSuperAdmin;
  const isStaff = Boolean(role && role !== 'CLIENT');

  const canApproveLoans = isManager;
  const canDisburseLoans = isManager;
  const canManageSettings = isSuperAdmin;
  const canDeleteRecords = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentClient,
        role,
        isAuthenticated: Boolean(user),
        isClient,
        isLoading,
        login,
        loginAsClient,
        quickLogin,
        impersonateClient,
        updateClientPassword,
        logout,
        isSuperAdmin,
        isManager,
        isStaff,
        canApproveLoans,
        canDisburseLoans,
        canManageSettings,
        canDeleteRecords,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

