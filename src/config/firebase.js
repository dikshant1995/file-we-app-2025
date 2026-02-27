import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD202jy_xSugCTboJVVttKI8HkbMzZlC0M",
    authDomain: "loan-eligibility-calculator.firebaseapp.com",
    projectId: "loan-eligibility-calculator",
    storageBucket: "loan-eligibility-calculator.firebasestorage.app",
    messagingSenderId: "799241054935",
    appId: "1:799241054935:web:61e1445ce9c45067499e92",
    measurementId: "G-QYVVRJYBVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
