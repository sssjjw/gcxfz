import React from 'react';
import CustomerApp from './pages/customer/CustomerApp';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MenuProvider } from './contexts/MenuContext';
import { OrderProvider } from './contexts/OrderContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <CartProvider>
            {/* 移除React Router，让CustomerApp处理所有路由（包括admin路由） */}
            <CustomerApp />
          </CartProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
};

export default App;