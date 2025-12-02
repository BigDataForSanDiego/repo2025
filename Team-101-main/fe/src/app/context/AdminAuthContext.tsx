'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  org_id: number;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (adminData: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = (adminData: AdminUser) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
