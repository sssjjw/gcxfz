import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import setupForceRefresh from './utils/forceRefresh';

// 应用启动前先检查版本，如需要会自动刷新
if (setupForceRefresh()) {
  // 获取基础路径，用于GitHub Pages子目录部署
  const basename = import.meta.env.DEV ? '/' : '/gcxfz/';
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
    </React.StrictMode>
);
}