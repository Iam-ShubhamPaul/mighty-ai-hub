// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mightyai-27d54.firebaseapp.com",
  projectId: "mightyai-27d54",
  storageBucket: "mightyai-27d54.firebasestorage.app",
  messagingSenderId: "766183341304",
  appId: "1:766183341304:web:c2b76b1ce9ec23d91acf0d",
  measurementId: "G-KZVSHLD9KG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export  const db = getFirestore(app);
