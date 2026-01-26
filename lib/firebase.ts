import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAyZ_qjT6a4DoasrBqA-O6hASA66OhyZQg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "shining-stars-56732.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "shining-stars-56732",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "shining-stars-56732.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "434581683283",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:434581683283:web:fad32925a653a5ef29daa6",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();
export const auth = getAuth();
