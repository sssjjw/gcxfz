import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 生成时间戳用于缓存破坏
const timestamp = Date.now().toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // 添加构建配置，使用时间戳破坏缓存
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${timestamp}.js`,
        chunkFileNames: `assets/[name]-[hash]-${timestamp}.js`,
        assetFileNames: `assets/[name]-[hash]-${timestamp}.[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  },
  // GitHub Pages配置
  base: process.env.NODE_ENV === 'production' ? '/gcxfz/' : '/',
  // 开发服务器配置
  server: {
    port: 5173,
    host: true
  }
});
