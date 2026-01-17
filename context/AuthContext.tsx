
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  isAdmin: boolean;
  allUsers: User[];
  deleteUser: (userId: string) => void;
  toggleBlockUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'bittusha411@gmail.com';
const ADMIN_PASS = 'admin@123';
const DEMO_USER_EMAIL = 'user@gmail.com';
const DEMO_USER_PASS = 'user@123';

interface StoredUser extends User {
  pass: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('vanphal_users');
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    }
    
    const savedSession = localStorage.getItem('vanphal_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      const adminUser: User = { id: 'admin-1', name: 'Vanphal Admin', email, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('vanphal_session', JSON.stringify(adminUser));
      return true;
    }

    if (email === DEMO_USER_EMAIL && pass === DEMO_USER_PASS) {
      const demoUser: User = { id: 'user-demo', name: 'Himalayan Explorer', email, role: 'user' };
      setUser(demoUser);
      localStorage.setItem('vanphal_session', JSON.stringify(demoUser));
      return true;
    }

    const found = registeredUsers.find(u => u.email === email && u.pass === pass);
    if (found) {
      if (found.isBlocked) {
        alert("Your account has been restricted by administration.");
        return false;
      }
      setUser(found);
      localStorage.setItem('vanphal_session', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string) => {
    const isReserved = email === ADMIN_EMAIL || email === DEMO_USER_EMAIL;
    const exists = registeredUsers.some(u => u.email === email);
    
    if (isReserved || exists) return false;

    const newUser: StoredUser = { 
      id: `user-${Date.now()}`, 
      name, email, pass, role: 'user',
      address: '', city: '', state: '', zip: '', phone: '', avatar: '', isBlocked: false
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('vanphal_users', JSON.stringify(updatedUsers));
    setUser(newUser);
    localStorage.setItem('vanphal_session', JSON.stringify(newUser));
    return true;
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('vanphal_session', JSON.stringify(newUser));

    const updatedList = registeredUsers.map(u => u.id === user.id ? { ...u, ...updatedData } : u);
    setRegisteredUsers(updatedList);
    localStorage.setItem('vanphal_users', JSON.stringify(updatedList));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vanphal_session');
  };

  const deleteUser = (userId: string) => {
    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem('vanphal_users', JSON.stringify(updated));
  };

  const toggleBlockUser = (userId: string) => {
    const updated = registeredUsers.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    setRegisteredUsers(updated);
    localStorage.setItem('vanphal_users', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, updateProfile, 
      isAdmin: user?.role === 'admin',
      allUsers: registeredUsers,
      deleteUser, toggleBlockUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
