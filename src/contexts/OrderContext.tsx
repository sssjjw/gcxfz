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

// 检查是否使用Firebase
const useFirebase = () => {
  return process.env.VITE_USE_FIREBASE === 'true';
};

// 从localStorage加载订单
const loadOrdersFromStorage = (): Order[] => {
  try {
    const ordersJson = localStorage.getItem('orders');
    const deletedOrdersJson = localStorage.getItem('deletedOrders');
    
    let orders: Order[] = [];
    let deletedOrders: string[] = [];
    
    // 加载订单数据
    if (ordersJson) {
      orders = JSON.parse(ordersJson);
      // 兼容旧版本订单数据，添加缺失的字段
      orders = orders.map((order: any) => ({
        ...order,
        groupName: order.groupName || '未知群昵称',
        notes: order.notes || undefined,
      }));
    }
    
    // 加载已删除订单列表
    if (deletedOrdersJson) {
      deletedOrders = JSON.parse(deletedOrdersJson);
    }
    
    // 过滤掉已删除的订单
    const filteredOrders = orders.filter(order => !deletedOrders.includes(order.id));
    
    console.log(`📥 加载订单数据: 原始${orders.length}个，过滤掉${orders.length - filteredOrders.length}个已删除，最终${filteredOrders.length}个`);
    
    return filteredOrders;
  } catch (error) {
    console.error('加载订单数据失败:', error);
  }
  return [];
};

// 保存订单到localStorage
const saveOrdersToStorage = (orders: Order[]) => {
  try {
    console.log('💾 saveOrdersToStorage 被调用，订单数量:', orders.length);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ 订单数据已保存到localStorage');
  } catch (error) {
    console.error('❌ 保存订单数据失败:', error);
  }
};

// 添加到已删除列表
const addToDeletedList = (orderId: string) => {
  try {
    const deletedOrdersJson = localStorage.getItem('deletedOrders');
    let deletedOrders: string[] = deletedOrdersJson ? JSON.parse(deletedOrdersJson) : [];
    
    if (!deletedOrders.includes(orderId)) {
      deletedOrders.push(orderId);
      localStorage.setItem('deletedOrders', JSON.stringify(deletedOrders));
      console.log(`🗑️ 订单 ${orderId} 已添加到删除列表，当前删除列表长度: ${deletedOrders.length}`);
    }
  } catch (error) {
    console.error('❌ 添加到删除列表失败:', error);
  }
};

// 清理过期的删除记录（保留最近100个）
const cleanupDeletedList = () => {
  try {
    const deletedOrdersJson = localStorage.getItem('deletedOrders');
    if (deletedOrdersJson) {
      let deletedOrders: string[] = JSON.parse(deletedOrdersJson);
      if (deletedOrders.length > 100) {
        // 只保留最新的100个删除记录
        deletedOrders = deletedOrders.slice(-100);
        localStorage.setItem('deletedOrders', JSON.stringify(deletedOrders));
        console.log('🧹 清理删除记录，保留最新100个');
      }
    }
  } catch (error) {
    console.error('❌ 清理删除记录失败:', error);
  }
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // 初始化数据加载
  useEffect(() => {
    const initializeData = async () => {
      if (useFirebase()) {
        console.log('🔥 使用Firebase模式');
        setIsFirebaseMode(true);
        try {
          // 使用Firebase实时监听
          const unsub = orderService.subscribeToOrders((firebaseOrders) => {
            console.log('📥 Firebase订单更新:', firebaseOrders.length);
            setOrders(firebaseOrders);
          });
          setUnsubscribe(() => unsub);
        } catch (error) {
          console.error('❌ Firebase初始化失败，回退到localStorage:', error);
          setIsFirebaseMode(false);
          setOrders(loadOrdersFromStorage());
        }
      } else {
        console.log('💾 使用localStorage模式');
        setIsFirebaseMode(false);
        setOrders(loadOrdersFromStorage());
        cleanupDeletedList();
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // localStorage模式下的数据同步
  useEffect(() => {
    if (!isFirebaseMode) {
      saveOrdersToStorage(orders);
    }
  }, [orders, isFirebaseMode]);

  // localStorage模式下监听外部更新事件
  useEffect(() => {
    if (!isFirebaseMode) {
      const handleOrderUpdate = (e: CustomEvent<Order[]>) => {
        console.log('📡 收到orderUpdate事件，detail:', e.detail);
        
        if (e.detail === null || (Array.isArray(e.detail) && e.detail.length === 0)) {
          console.log('🗑️ 清空订单数据');
          setOrders([]);
          return;
        }
        
        if (e.detail && Array.isArray(e.detail)) {
          try {
            const deletedOrdersJson = localStorage.getItem('deletedOrders');
            const deletedOrders: string[] = deletedOrdersJson ? JSON.parse(deletedOrdersJson) : [];
            
            const filteredDetail = e.detail.filter(order => !deletedOrders.includes(order.id));
            console.log(`🔄 过滤外部事件数据: 原始${e.detail.length}个，过滤后${filteredDetail.length}个`);
            
            if (JSON.stringify(orders) !== JSON.stringify(filteredDetail)) {
              console.log('🔄 更新订单数据');
              setOrders(filteredDetail);
            }
          } catch (error) {
            console.error('❌ 处理外部事件失败:', error);
          }
        }
      };

      window.addEventListener('orderUpdate', handleOrderUpdate as EventListener);
      return () => {
        window.removeEventListener('orderUpdate', handleOrderUpdate as EventListener);
      };
    }
  }, [orders, isFirebaseMode]);

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

    if (isFirebaseMode) {
      try {
        return await orderService.createOrder(orderData);
      } catch (error) {
        console.error('❌ Firebase创建订单失败:', error);
        throw error;
      }
    } else {
      const newOrder: Order = {
        id: `order-${now.getTime()}`,
        ...orderData
      };

      setOrders((prevOrders) => [...prevOrders, newOrder]);
      return newOrder;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    if (isFirebaseMode) {
      try {
        await orderService.updateOrderStatus(id, status);
      } catch (error) {
        console.error('❌ Firebase更新订单状态失败:', error);
        throw error;
      }
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date() }
            : order
        )
      );
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    console.log('🗑️ 删除订单:', id);
    
    if (isFirebaseMode) {
      try {
        await orderService.deleteOrder(id);
      } catch (error) {
        console.error('❌ Firebase删除订单失败:', error);
        throw error;
      }
    } else {
      addToDeletedList(id);
      
      setOrders((prevOrders) => {
        const filteredOrders = prevOrders.filter((order) => order.id !== id);
        console.log('💾 删除后订单数量:', filteredOrders.length);
        
        try {
          localStorage.setItem('orders', JSON.stringify(filteredOrders));
          console.log('✅ 删除操作已同步到localStorage');
        } catch (error) {
          console.error('❌ 删除操作同步失败:', error);
        }
        
        return filteredOrders;
      });
      
      setTimeout(() => {
        cleanupDeletedList();
      }, 1000);
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
    console.log('🧹 手动清理所有订单和删除记录');
    
    if (isFirebaseMode) {
      try {
        // 这里需要实现Firebase的清理方法
        console.log('Firebase清理功能待实现');
      } catch (error) {
        console.error('❌ Firebase清理失败:', error);
        throw error;
      }
    } else {
      setOrders([]);
      localStorage.removeItem('orders');
      localStorage.removeItem('deletedOrders');
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