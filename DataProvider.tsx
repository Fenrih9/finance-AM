import React, { useState, useEffect, ReactNode } from 'react';
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
    Timestamp
} from 'firebase/firestore';
import { DataContext } from './DataContext';

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
            } else {
                setIsAuthenticated(false);
                setUser({ name: '', email: '', avatar: null });
                setTransactions([]);
                setCategories([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Firestore Transactions Listener
    useEffect(() => {
        // Only run if we have a valid, authenticated user with a UID
        if (!isAuthenticated || !auth.currentUser) return;

        // Remove sorting from query to avoid missing index issues. 
        // If the composite index is missing, the listener will silently fail or error out without updating data.
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Transaction[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
                } as Transaction;
            });

            // Sort client-side
            docs.sort((a, b) => b.date.getTime() - a.date.getTime());

            setTransactions(docs);
        }, (error) => {
            console.error("Error fetching transactions:", error);
        });

        return () => unsubscribe();
    }, [isAuthenticated, user.email]); // Add user dependency to ensure re-run if user context changes



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
        if (!auth.currentUser) return;

        try {
            await addDoc(collection(db, 'transactions'), {
                userId: auth.currentUser.uid,
                ...t,
                date: Timestamp.fromDate(t.date) // Ensure date is saved as Timestamp
            });

            // Notifications are local only for now, or could be another collection
            const newNotification: Notification = {
                id: Math.random().toString(36).substr(2, 9),
                title: t.type === 'expense' ? 'Despesa Registrada' : 'Receita Recebida',
                message: `${t.description} de R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi adicionado(a).`,
                date: new Date(),
                read: false,
                type: t.type === 'expense' ? 'alert' : 'success'
            };
            setNotifications(prev => [newNotification, ...prev]);

        } catch (error) {
            console.error("Error adding transaction: ", error);
            alert("Erro ao salvar transação. Tente novamente.");
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'transactions', id));
        } catch (error) {
            console.error("Error deleting transaction: ", error);
            alert("Erro ao excluir transação.");
        }
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

    // Initial Balance Configuration
    const INITIAL_BALANCE = 56925.05;

    const balance = income - expense + INITIAL_BALANCE;

    return (
        <DataContext.Provider value={{
            user,
            isAuthenticated,
            transactions,
            notifications,
            initialBalance: INITIAL_BALANCE,
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
