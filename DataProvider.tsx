import React, { useState, useEffect, ReactNode } from 'react';
import { Transaction, Notification, UserProfile, Category } from './types';
import { auth, db } from './firebaseConfig';
import {
    validateTransaction,
    validateCategory,
    sanitizeInput,
    formatUserError,
    validatePassword
} from './security-utils';
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
                // SECURITY: Clear all sensitive data on logout
                setIsAuthenticated(false);
                setUser({ name: '', email: '', avatar: null });
                setTransactions([]);
                setCategories([]);
                setNotifications([]);
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
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            // SECURITY: Don't expose technical error details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
        }
    };

    const register = async (name: string, email: string, pass: string) => {
        try {
            // SECURITY: Validate password strength before sending to Firebase
            const passwordValidation = validatePassword(pass);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors[0]);
            }

            // SECURITY: Sanitize name input
            const sanitizedName = sanitizeInput(name);
            if (!sanitizedName || sanitizedName.length < 2) {
                throw new Error('Nome inválido');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: sanitizedName
                });
                setUser(prev => ({ ...prev, name: sanitizedName }));
            }
        } catch (error) {
            // SECURITY: Don't expose technical error details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
        }
    };

    const logout = async () => {
        try {
            // SECURITY: Clear local state before signing out
            setTransactions([]);
            setCategories([]);
            setNotifications([]);
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            // Force clear state even if signOut fails
            setIsAuthenticated(false);
            setUser({ name: '', email: '', avatar: null });
            setTransactions([]);
            setCategories([]);
            setNotifications([]);
        }
    };

    const updateUser = async (u: Partial<UserProfile>) => {
        if (auth.currentUser) {
            try {
                // SECURITY: Sanitize inputs
                const updates: Partial<UserProfile> = {};

                if (u.name) {
                    const sanitizedName = sanitizeInput(u.name);
                    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
                        throw new Error('Nome inválido');
                    }
                    updates.name = sanitizedName;
                }

                // Check if avatar property exists (not just truthy) to allow null
                if ('avatar' in u) {
                    updates.avatar = u.avatar;
                }

                // Update Firebase Auth profile
                if (updates.name || 'avatar' in updates) {
                    await updateProfile(auth.currentUser, {
                        displayName: updates.name || auth.currentUser.displayName,
                        photoURL: updates.avatar !== undefined ? updates.avatar : auth.currentUser.photoURL
                    });
                }

                setUser(prev => ({ ...prev, ...updates }));
            } catch (error) {
                const userMessage = formatUserError(error);
                throw new Error(userMessage);
            }
        }
    };

    const addTransaction = async (t: Omit<Transaction, 'id'>) => {
        if (!auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            // SECURITY: Validate transaction data before sending
            const validation = validateTransaction({
                amount: t.amount,
                description: t.description,
                type: t.type,
                category: t.category,
                date: t.date
            });

            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }

            // SECURITY: Sanitize description
            const sanitizedDescription = sanitizeInput(t.description);

            await addDoc(collection(db, 'transactions'), {
                userId: auth.currentUser.uid,
                amount: t.amount,
                type: t.type,
                category: t.category,
                description: sanitizedDescription,
                date: Timestamp.fromDate(t.date)
            });

            // Local notification
            const newNotification: Notification = {
                id: Math.random().toString(36).substr(2, 9),
                title: t.type === 'expense' ? 'Despesa Registrada' : 'Receita Recebida',
                message: `${sanitizedDescription} de R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi adicionado(a).`,
                date: new Date(),
                read: false,
                type: t.type === 'expense' ? 'alert' : 'success'
            };
            setNotifications(prev => [newNotification, ...prev]);

        } catch (error) {
            // SECURITY: Don't expose technical details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
        }
    };

    const deleteTransaction = async (id: string) => {
        if (!auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            await deleteDoc(doc(db, 'transactions', id));
        } catch (error) {
            // SECURITY: Don't expose technical details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
        }
    };

    const addCategory = async (c: Omit<Category, 'id'>) => {
        if (!auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            // SECURITY: Validate category data
            const validation = validateCategory({
                name: c.name,
                type: c.type
            });

            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }

            // SECURITY: Sanitize name
            const sanitizedName = sanitizeInput(c.name);

            await addDoc(collection(db, 'categories'), {
                userId: auth.currentUser.uid,
                name: sanitizedName,
                type: c.type,
                color: c.color,
                icon: c.icon
            });
        } catch (error) {
            // SECURITY: Don't expose technical details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        try {
            await deleteDoc(doc(db, 'categories', id));
        } catch (error) {
            // SECURITY: Don't expose technical details
            const userMessage = formatUserError(error);
            throw new Error(userMessage);
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
