import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD9D1bKRLvS6GwnJLfjRDBjMkKkQtvlifE",
    authDomain: "laxmi-credit-enterprise.firebaseapp.com",
    projectId: "laxmi-credit-enterprise",
    storageBucket: "laxmi-credit-enterprise.firebasestorage.app",
    messagingSenderId: "70791817257",
    appId: "1:70791817257:web:8c0bf346d9636905e41438",
    measurementId: "G-J1R46P3Z81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
