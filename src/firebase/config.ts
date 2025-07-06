import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 检测运行环境 - 优先使用localStorage模式避免Firebase连接问题
const isProduction = import.meta.env.PROD;
const forceLocalStorage = true; // 强制使用localStorage模式

// Firebase配置 - 仅在生产环境且不强制localStorage时使用
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDve-6wTpWZ5l2EEbqSFpAuWcbd0ZfB5gM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gcxst-aa627.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gcxst-aa627",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gcxst-aa627.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685579319006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685579319006:web:1a13851f36bb06d7edf44f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-13PD035W0T"
};

console.log('💾 使用localStorage模式，避免Firebase配置问题');

// 条件初始化Firebase
let app: any = null;
let db: any = null;
let auth: any = null;

if (!forceLocalStorage && isProduction) {
  try {
    // 初始化Firebase
    app = initializeApp(firebaseConfig);
    
    // 初始化Firestore
    db = getFirestore(app);
    
    // 初始化Auth
    auth = getAuth(app);
    
    console.log('🔥 Firebase已初始化');
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error);
    console.log('💾 回退到localStorage模式');
  }
} else {
  console.log('💾 使用localStorage模式，跳过Firebase初始化');
}

export { db, auth };

export default app; 