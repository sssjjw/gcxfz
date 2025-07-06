import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 清理配置值，移除可能的空白字符和特殊字符
const cleanConfigValue = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  // 移除所有空白字符（包括空格、TAB、换行符等）
  return value.replace(/\s/g, '').trim();
};

// Firebase配置 - 新的云端数据存储项目
const firebaseConfig = {
  apiKey: cleanConfigValue(import.meta.env.VITE_FIREBASE_API_KEY, "AIzaSyBwgWBxCIarv1kO0kXpUuXCAA7TaVvbqrA"),
  authDomain: cleanConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "gcxfz-restaurant.firebaseapp.com"),
  projectId: cleanConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, "gcxfz-restaurant"),
  storageBucket: cleanConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "gcxfz-restaurant.firebasestorage.app"),
  messagingSenderId: cleanConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "112720952941"),
  appId: cleanConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, "1:112720952941:web:ab4e3dce42b152edba0964")
};

// 添加配置验证和调试信息
console.log('🔥 使用Firebase云端数据存储');
console.log('🔧 Firebase配置验证:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'undefined',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'undefined'
});

// 验证关键配置
if (!firebaseConfig.projectId || firebaseConfig.projectId.length === 0) {
  console.error('❌ Firebase projectId未正确配置');
  throw new Error('Firebase projectId配置错误');
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length === 0) {
  console.error('❌ Firebase apiKey未正确配置');
  throw new Error('Firebase apiKey配置错误');
}

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化Firestore
export const db = getFirestore(app);

// 初始化Auth
export const auth = getAuth(app);

console.log('🔥 Firebase已成功初始化');

export default app; 