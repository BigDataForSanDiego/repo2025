'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Employer {
  id: number;
  email: string;
  company_name: string;
}

interface EmployerAuthContextType {
  employer: Employer | null;
  loading: boolean;
  login: (employerData: Employer) => void;
  logout: () => void;
}

const EmployerAuthContext = createContext<EmployerAuthContextType | undefined>(undefined);

export function EmployerAuthProvider({ children }: { children: React.ReactNode }) {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('employer');
    if (stored) {
      try {
        setEmployer(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('employer');
      }
    }
    setLoading(false);
  }, []);

  const login = (employerData: Employer) => {
    setEmployer(employerData);
    localStorage.setItem('employer', JSON.stringify(employerData));
  };

  const logout = () => {
    setEmployer(null);
    localStorage.removeItem('employer');
  };

  return (
    <EmployerAuthContext.Provider value={{ employer, loading, login, logout }}>
      {children}
    </EmployerAuthContext.Provider>
  );
}

export function useEmployerAuth() {
  const context = useContext(EmployerAuthContext);
  if (!context) {
    throw new Error('useEmployerAuth must be used within EmployerAuthProvider');
  }
  return context;
}
