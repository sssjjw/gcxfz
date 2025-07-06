import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Order } from '../contexts/OrderContext';
import { MenuItem } from '../contexts/MenuContext';

// 检查Firebase是否可用
const isFirebaseAvailable = () => {
  return db && typeof db === 'object';
};

// localStorage服务作为Firebase的后备方案
const localStorageService = {
  getOrders(): Order[] {
    try {
      const ordersData = localStorage.getItem('restaurant_orders');
      return ordersData ? JSON.parse(ordersData) : [];
    } catch {
      return [];
    }
  },
  
  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem('restaurant_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('保存订单到localStorage失败:', error);
    }
  },
  
  getMenuItems(): MenuItem[] {
    try {
      const menuData = localStorage.getItem('restaurant_menu');
      return menuData ? JSON.parse(menuData) : [];
    } catch {
      return [];
    }
  },
  
  saveMenuItems(items: MenuItem[]): void {
    try {
      localStorage.setItem('restaurant_menu', JSON.stringify(items));
    } catch (error) {
      console.error('保存菜单到localStorage失败:', error);
    }
  }
};

// 集合名称常量
const COLLECTIONS = {
  ORDERS: 'orders',
  MENU_ITEMS: 'menuItems',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  DELETED_ORDERS: 'deletedOrders'
};

// ================== 订单服务 ==================
export const orderService = {
  // 获取所有订单
  async getAllOrders(): Promise<Order[]> {
    if (!isFirebaseAvailable()) {
      console.log('💾 使用localStorage获取订单');
      return localStorageService.getOrders();
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[];
    } catch (error) {
      console.error('获取订单失败，回退到localStorage:', error);
      return localStorageService.getOrders();
    }
  },

  // 创建订单
  async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    const newOrder = {
      id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!isFirebaseAvailable()) {
      console.log('💾 使用localStorage创建订单');
      const orders = localStorageService.getOrders();
      orders.unshift(newOrder);
      localStorageService.saveOrders(orders);
      console.log('✅ 订单创建成功(localStorage):', newOrder.id);
      return newOrder;
    }
    
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const firebaseOrder = {
        id: docRef.id,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ 订单创建成功(Firebase):', firebaseOrder.id);
      return firebaseOrder;
    } catch (error) {
      console.error('Firebase创建订单失败，回退到localStorage:', error);
      const orders = localStorageService.getOrders();
      orders.unshift(newOrder);
      localStorageService.saveOrders(orders);
      console.log('✅ 订单创建成功(localStorage后备):', newOrder.id);
      return newOrder;
    }
  },

  // 更新订单状态
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!isFirebaseAvailable()) {
      console.log('💾 使用localStorage更新订单状态');
      const orders = localStorageService.getOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date();
        localStorageService.saveOrders(orders);
        console.log('✅ 订单状态更新成功(localStorage):', orderId, status);
      }
      return;
    }
    
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      console.log('✅ 订单状态更新成功(Firebase):', orderId, status);
    } catch (error) {
      console.error('Firebase更新订单状态失败，回退到localStorage:', error);
      const orders = localStorageService.getOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date();
        localStorageService.saveOrders(orders);
        console.log('✅ 订单状态更新成功(localStorage后备):', orderId, status);
      }
    }
  },

  // 删除订单
  async deleteOrder(orderId: string): Promise<void> {
    try {
      // 将订单ID添加到删除列表
      await this.addToDeletedList(orderId);
      
      // 从订单集合中删除
      await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
      
      console.log('✅ 订单删除成功:', orderId);
    } catch (error) {
      console.error('删除订单失败:', error);
      throw error;
    }
  },

  // 添加到删除列表
  async addToDeletedList(orderId: string): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.DELETED_ORDERS, orderId), {
        deletedAt: serverTimestamp(),
        orderId
      });
    } catch (error) {
      console.error('添加到删除列表失败:', error);
    }
  },

  // 获取删除的订单ID列表
  async getDeletedOrderIds(): Promise<string[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.DELETED_ORDERS));
      return querySnapshot.docs.map(doc => doc.data().orderId);
    } catch (error) {
      console.error('获取删除列表失败:', error);
      return [];
    }
  },

  // 实时监听订单变化
  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    const unsubscribe = onSnapshot(
      query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        try {
          // 获取删除的订单ID列表
          const deletedIds = await this.getDeletedOrderIds();
          
          const orders = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }))
            .filter(order => !deletedIds.includes(order.id)) as Order[];
          
          callback(orders);
        } catch (error) {
          console.error('处理订单更新失败:', error);
        }
      },
      (error) => {
        console.error('订单监听失败:', error);
      }
    );
    
    return unsubscribe;
  }
};

// ================== 菜单服务 ==================
export const menuService = {
  // 获取所有菜品
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.MENU_ITEMS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
    } catch (error) {
      console.error('获取菜品失败:', error);
      return [];
    }
  },

  // 创建菜品
  async createMenuItem(menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MENU_ITEMS), menuItem);
      return { id: docRef.id, ...menuItem };
    } catch (error) {
      console.error('创建菜品失败:', error);
      throw error;
    }
  },

  // 更新菜品
  async updateMenuItem(id: string, menuItem: Partial<MenuItem>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.MENU_ITEMS, id), menuItem);
    } catch (error) {
      console.error('更新菜品失败:', error);
      throw error;
    }
  },

  // 删除菜品
  async deleteMenuItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, id));
    } catch (error) {
      console.error('删除菜品失败:', error);
      throw error;
    }
  }
};

// ================== 设置服务 ==================
export const settingsService = {
  // 获取设置
  async getSetting(key: string): Promise<any> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, key));
      return docSnap.exists() ? docSnap.data().value : null;
    } catch (error) {
      console.error('获取设置失败:', error);
      return null;
    }
  },

  // 保存设置
  async setSetting(key: string, value: any): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, key), { 
        value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  },

  // 删除设置
  async deleteSetting(key: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SETTINGS, key));
    } catch (error) {
      console.error('删除设置失败:', error);
      throw error;
    }
  }
};

// ================== 数据迁移工具 ==================
export const migrationService = {
  // 从localStorage迁移数据到Firebase
  async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('🚀 开始数据迁移...');
      
      // 迁移订单数据
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const batch = writeBatch(db);
        
        orders.forEach(order => {
          const orderRef = doc(collection(db, COLLECTIONS.ORDERS));
          batch.set(orderRef, {
            ...order,
            createdAt: Timestamp.fromDate(new Date(order.createdAt)),
            updatedAt: Timestamp.fromDate(new Date(order.updatedAt))
          });
        });
        
        await batch.commit();
        console.log(`✅ 迁移了 ${orders.length} 个订单`);
      }

      // 迁移菜单数据
      const menuItemsJson = localStorage.getItem('menuItems');
      if (menuItemsJson) {
        const menuItems: MenuItem[] = JSON.parse(menuItemsJson);
        const batch = writeBatch(db);
        
        menuItems.forEach(item => {
          const itemRef = doc(collection(db, COLLECTIONS.MENU_ITEMS));
          batch.set(itemRef, item);
        });
        
        await batch.commit();
        console.log(`✅ 迁移了 ${menuItems.length} 个菜品`);
      }

      // 迁移设置数据
      const settingsKeys = [
        'categories',
        'restaurantInfo',
        'announcementData',
        'discounts',
        'deletedOrders'
      ];

      for (const key of settingsKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          await settingsService.setSetting(key, JSON.parse(value));
          console.log(`✅ 迁移了设置: ${key}`);
        }
      }

      console.log('🎉 数据迁移完成！');
    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
      throw error;
    }
  },

  // 清空所有Firebase数据
  async clearAllData(): Promise<void> {
    try {
      console.log('🧹 开始清空Firebase数据...');
      
      // 清空订单
      const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
      const ordersBatch = writeBatch(db);
      ordersSnapshot.docs.forEach(doc => {
        ordersBatch.delete(doc.ref);
      });
      await ordersBatch.commit();

      // 清空菜品
      const menuSnapshot = await getDocs(collection(db, COLLECTIONS.MENU_ITEMS));
      const menuBatch = writeBatch(db);
      menuSnapshot.docs.forEach(doc => {
        menuBatch.delete(doc.ref);
      });
      await menuBatch.commit();

      // 清空设置
      const settingsSnapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
      const settingsBatch = writeBatch(db);
      settingsSnapshot.docs.forEach(doc => {
        settingsBatch.delete(doc.ref);
      });
      await settingsBatch.commit();

      console.log('✅ Firebase数据清空完成');
    } catch (error) {
      console.error('❌ 清空数据失败:', error);
      throw error;
    }
  }
}; 