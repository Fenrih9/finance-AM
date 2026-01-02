import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, Notification, UserProfile, Category } from './types';
import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

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

const DataContext = createContext<DataContextType>({
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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatar: null });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUser({
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || null
        });

        // Carregar dados locais ou do Firestore futuramente
        // Por enquanto, mantemos transações locais/localStorage para não perder a funcionalidade imediata
        const savedTransactions = localStorage.getItem(`financas_transactions_${firebaseUser.uid}`);
        if (savedTransactions) {
          const parsed = JSON.parse(savedTransactions);
          setTransactions(parsed.map((t: any) => ({ ...t, date: new Date(t.date) })));
        } else {
          setTransactions([]);
        }

      } else {
        setIsAuthenticated(false);
        setUser({ name: '', email: '', avatar: null });
        setTransactions([]);
        setCategories([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persistir transações localmente por usuário (simples cache)
  useEffect(() => {
    if (isAuthenticated && auth.currentUser) {
      localStorage.setItem(`financas_transactions_${auth.currentUser.uid}`, JSON.stringify(transactions));
    }
  }, [transactions, isAuthenticated]);

  // Firestore Categories Listener
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Category, 'id'>
      }));
      setCategories(docs);
    }, (error) => {
      console.error("Error fetching categories:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);


  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // Atualiza estado local imediatamente para refletir o nome
      setUser(prev => ({ ...prev, name }));
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (u: Partial<UserProfile>) => {
    if (auth.currentUser) {
      // Atualiza perfil no Firebase Auth se houver campos relevantes
      if (u.name || u.avatar) {
        await updateProfile(auth.currentUser, {
          displayName: u.name || auth.currentUser.displayName,
          photoURL: u.avatar || auth.currentUser.photoURL
        });
      }
      setUser(prev => ({ ...prev, ...u }));
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      date: t.date
    };

    setTransactions(prev => [newTransaction, ...prev]);

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: t.type === 'expense' ? 'Despesa Registrada' : 'Receita Recebida',
      message: `${t.description} de R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi adicionado(a).`,
      date: new Date(),
      read: false,
      type: t.type === 'expense' ? 'alert' : 'success'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    if (!auth.currentUser) {
      alert("Erro: Usuário não autenticado internamente.");
      return;
    }
    try {
      await addDoc(collection(db, 'categories'), {
        userId: auth.currentUser.uid,
        ...c
      });
      alert("Categoria salva com sucesso!");
    } catch (error: any) {
      console.error("Error adding category: ", error);
      alert(`Erro ao salvar categoria: ${error.message || error}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  // Cálculos
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  return (
    <DataContext.Provider value={{
      user,
      isAuthenticated,
      transactions,
      notifications,
      balance,
      income,
      expense,
      addTransaction,
      deleteTransaction,
      updateUser,
      login,
      register,
      logout,
      categories,
      addCategory,
      deleteCategory
    }}>
      {children}
    </DataContext.Provider>
  );
};