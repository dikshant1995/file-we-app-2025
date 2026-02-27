import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCRcHH37y5rLy34xSW1OdSy5MklnSnuO6o",
    authDomain: "laxmi-credit.firebaseapp.com",
    projectId: "laxmi-credit",
    storageBucket: "laxmi-credit.firebasestorage.app",
    messagingSenderId: "439589007843",
    appId: "1:439589007843:web:63d32a89b258686144f0d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
