import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import setupForceRefresh from './utils/forceRefresh';

// 应用启动前先检查版本，如需要会自动刷新
if (setupForceRefresh()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </React.StrictMode>
);
}