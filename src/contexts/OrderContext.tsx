import React, { createContext, useState, useContext, useEffect } from 'react';
import { CartItem } from './CartContext';
import { orderService } from '../firebase/services';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  status: OrderStatus;
  pickupCode: string;
  groupName: string; // 群昵称
  notes?: string; // 备注（可选）
  createdAt: Date;
  updatedAt: Date;
  customerId?: string;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], total: number, subtotal: number, discount: number, groupName: string, notes?: string) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrdersByDate: (date: Date) => Order[];
  getOrderById: (id: string) => Order | undefined;
  clearAllOrders: () => Promise<void>;
  migrateToFirebase: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// 现在完全使用Firebase，移除localStorage相关代码

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // 初始化Firebase实时监听
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔥 使用Firebase云端订单存储');
      try {
        // 使用Firebase实时监听
        const unsub = orderService.subscribeToOrders((firebaseOrders) => {
          console.log('📥 Firebase订单更新:', firebaseOrders.length);
          setOrders(firebaseOrders);
        });
        setUnsubscribe(() => unsub);
      } catch (error) {
        console.error('❌ Firebase初始化失败:', error);
        // Firebase失败时设置空数组
        setOrders([]);
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Generate pickup code with today's date + sequence number (e.g., 20241215001)
  const generatePickupCode = (): string => {
    const today = new Date();
    const dateString = today.getFullYear().toString() +
                      (today.getMonth() + 1).toString().padStart(2, '0') +
                      today.getDate().toString().padStart(2, '0');
    
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayOrders = orders.filter(
      (order) => {
        const orderCreatedAt = order.createdAt instanceof Date 
          ? order.createdAt 
          : new Date(order.createdAt);
        
        return orderCreatedAt >= startOfDay && orderCreatedAt <= endOfDay;
      }
    );
    
    const sequence = (todayOrders.length + 1).toString().padStart(3, '0');
    return `${dateString}${sequence}`;
  };

  const createOrder = async (
    items: CartItem[],
    total: number,
    subtotal: number,
    discount: number,
    groupName: string,
    notes?: string
  ): Promise<Order> => {
    console.log('🍕 OrderContext.createOrder 被调用，参数:', {
      items: items.length,
      total,
      subtotal,
      discount,
      groupName,
      notes
    });
    
    const now = new Date();
    const orderData = {
      items,
      total,
      subtotal,
      discount,
      status: 'pending' as OrderStatus,
      pickupCode: generatePickupCode(),
      groupName,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      console.error('❌ Firebase创建订单失败:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    try {
      await orderService.updateOrderStatus(id, status);
    } catch (error) {
      console.error('❌ Firebase更新订单状态失败:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    console.log('🗑️ 删除订单:', id);
    
    try {
      await orderService.deleteOrder(id);
    } catch (error) {
      console.error('❌ Firebase删除订单失败:', error);
      throw error;
    }
  };

  const getOrdersByDate = (date: Date): Order[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return orders.filter(
      (order) => {
        const orderCreatedAt = order.createdAt instanceof Date 
          ? order.createdAt 
          : new Date(order.createdAt);
        
        return orderCreatedAt >= startOfDay && orderCreatedAt <= endOfDay;
      }
    );
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const clearAllOrders = async (): Promise<void> => {
    console.log('🧹 手动清理所有Firebase订单数据');
    
    try {
      const { migrationService } = await import('../firebase/services');
      await migrationService.clearAllData();
      console.log('✅ Firebase数据清理完成');
    } catch (error) {
      console.error('❌ Firebase清理失败:', error);
      throw error;
    }
  };

  const migrateToFirebase = async (): Promise<void> => {
    try {
      console.log('🚀 开始迁移数据到Firebase...');
      const { migrationService } = await import('../firebase/services');
      await migrationService.migrateFromLocalStorage();
      console.log('✅ 数据迁移完成');
    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        getOrdersByDate,
        getOrderById,
        clearAllOrders,
        migrateToFirebase,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};