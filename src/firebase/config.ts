import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase配置 - 使用云端数据存储
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDve-6wTpWZ5l2EEbqSFpAuWcbd0ZfB5gM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gcxst-aa627.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gcxst-aa627",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gcxst-aa627.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685579319006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685579319006:web:1a13851f36bb06d7edf44f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-13PD035W0T"
};

console.log('🔥 使用Firebase云端数据存储');

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化Firestore
export const db = getFirestore(app);

// 初始化Auth
export const auth = getAuth(app);

console.log('🔥 Firebase已成功初始化');

export default app; 