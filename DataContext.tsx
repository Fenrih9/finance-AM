import { createContext, useContext } from 'react';
import { Transaction, Notification, UserProfile, Category } from './types';

interface DataContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  transactions: Transaction[];
  notifications: Notification[];
  categories: Category[];
  balance: number;
  income: number;
  expense: number;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateUser: (u: Partial<UserProfile>) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({
  user: { name: '', email: '', avatar: null },
  isAuthenticated: false,
  transactions: [],
  notifications: [],
  balance: 0,
  income: 0,
  expense: 0,
  addTransaction: async () => { },
  deleteTransaction: async () => { },
  updateUser: () => { },
  login: async () => { },
  register: async () => { },
  logout: async () => { },
});

export const useData = () => useContext(DataContext);