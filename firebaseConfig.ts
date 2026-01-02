
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyACeN4QXFy-1UJlS81ElshIrS_90xBo-Tk",
    authDomain: "finance-9.firebaseapp.com",
    projectId: "finance-9",
    storageBucket: "finance-9.firebasestorage.app",
    messagingSenderId: "654530932526",
    appId: "1:654530932526:web:fc857c06a642b2abf514bf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
