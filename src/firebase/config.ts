import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase配置 - 新的云端数据存储项目
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwgWBxCIarv1kO0kXpUuXCAA7TaVvbqrA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gcxfz-restaurant.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gcxfz-restaurant",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gcxfz-restaurant.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "112720952941",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:112720952941:web:ab4e3dce42b152edba0964"
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