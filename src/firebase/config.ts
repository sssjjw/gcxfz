import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase配置 - 您需要用您的Firebase项目配置替换这些值
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDve-6wTpWZ5l2EEbqSFpAuWcbd0ZfB5gM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gcxst-aa627.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gcxst-aa627",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gcxst-aa627.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685579319006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685579319006:web:1a13851f36bb06d7edf44f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-13PD035W0T"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化Firestore
export const db = getFirestore(app);

// 初始化Auth
export const auth = getAuth(app);

// 开发环境下连接到Firestore模拟器（可选）
if (process.env.NODE_ENV === 'development' && !('_delegate' in db)) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 已连接到Firestore模拟器');
  } catch (error) {
    console.log('⚠️ Firestore模拟器连接失败，使用远程数据库');
  }
}

export default app; 