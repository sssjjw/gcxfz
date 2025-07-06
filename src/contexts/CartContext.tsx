import React, { createContext, useState, useContext, useEffect } from 'react';
import { MenuItem, useMenu } from './MenuContext';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  variant?: string;
  special?: string;
  calculatedPrice?: number; // 预计算的单价，包含所有选项
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number, variant?: string, special?: string, calculatedPrice?: number) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: { type: string; value: number; savings: number };
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 从localStorage加载购物车数据
const loadCartFromStorage = (): CartItem[] => {
  try {
    const cartJson = localStorage.getItem('cart');
    if (cartJson) {
      return JSON.parse(cartJson);
    }
  } catch (error) {
    console.error('加载购物车数据失败:', error);
  }
  return [];
};

// 保存购物车数据到localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // 发送自定义事件通知其他组件
    const cartUpdateEvent = new CustomEvent('cartUpdate', { detail: items });
    window.dispatchEvent(cartUpdateEvent);
  } catch (error) {
    console.error('保存购物车数据失败:', error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage());
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState({ type: '', value: 0, savings: 0 });
  const [total, setTotal] = useState(0);
  const { menuItems } = useMenu();

  // 当购物车变化时保存到localStorage
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // 监听其他组件触发的购物车数据更新事件
  useEffect(() => {
    const handleCartUpdate = (e: CustomEvent<CartItem[]>) => {
      if (e.detail && JSON.stringify(items) !== JSON.stringify(e.detail)) {
        setItems(e.detail);
      }
    };

    window.addEventListener('cartUpdate', handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate as EventListener);
    };
  }, [items]);

  // 确保购物车中的菜品在菜单中仍然存在
  useEffect(() => {
    if (menuItems.length > 0 && items.length > 0) {
      // 过滤掉已不存在于菜单中的商品
      const validMenuItemIds = new Set(menuItems.map(item => item.id));
      const validCartItems = items.filter(item => validMenuItemIds.has(item.menuItem.id));
      
      // 如果有商品被过滤掉，更新购物车
      if (validCartItems.length !== items.length) {
        setItems(validCartItems);
      }
    }
  }, [menuItems, items]);

  // Generate a unique ID for cart items
  const generateCartItemId = (item: MenuItem, variant?: string): string => {
    return `${item.id}-${variant || 'default'}`;
  };

  const addItem = (item: MenuItem, quantity: number, variant?: string, special?: string, calculatedPrice?: number) => {
    setItems((prevItems) => {
      const itemKey = generateCartItemId(item, variant);
      const existingItemIndex = prevItems.findIndex(cartItem => 
        cartItem.menuItem.id === item.id && 
        cartItem.variant === variant && 
        cartItem.special === special
      );

      if (existingItemIndex >= 0) {
        // 商品已存在，更新数量
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        if (newQuantity <= 0) {
          // 如果数量为0或负数，移除该商品
          updatedItems.splice(existingItemIndex, 1);
        } else {
          // 更新数量
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity
          };
        }
        
        return updatedItems;
      } else if (quantity > 0) {
        // 商品不存在且数量大于0，添加新商品
        const newItem: CartItem = {
          id: `${itemKey}-${Date.now()}`,
          menuItem: item,
          quantity,
          variant,
          special,
          calculatedPrice,
        };
        
        return [...prevItems, newItem];
      }
      
      // 商品不存在且数量小于等于0，不做任何操作
      return prevItems;
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate cart totals whenever items change
  useEffect(() => {
    // Calculate total items
    const newTotalItems = items.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(newTotalItems);

    // Calculate subtotal
    const newSubtotal = items.reduce((total, item) => {
      let price = item.calculatedPrice !== undefined ? item.calculatedPrice : item.menuItem.price;
      
      // 如果没有预计算价格且有variant信息，从自定义选项中获取价格
      if (item.calculatedPrice === undefined && item.variant && item.menuItem.customOptions) {
        for (const group of item.menuItem.customOptions) {
          const option = group.options.find(opt => opt.name === item.variant);
          if (option && option.price !== undefined) {
            // 检查是否是替换价格模式还是附加费模式
            if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
              // 检查选项组中是否有选项没有价格（说明是基础价格+附加费模式）
              const hasOptionWithoutPrice = group.options.some(opt => opt.price === undefined);
              if (hasOptionWithoutPrice) {
                // 基础价格+附加费模式：只添加额外费用
                price += option.price;
              } else {
                // 完全替换价格模式：用选项价格替换基础价格
                price = option.price;
              }
            } else {
              // 其他类型的选项都是附加费
              price += option.price;
            }
            break;
          }
        }
      }
      
      return total + price * item.quantity;
    }, 0);
    setSubtotal(newSubtotal);

    // Apply discounts
    let discountSavings = 0;
    let discountType = '';
    let discountValue = 0;

    // Example discount: 10% off when spending over 100
    if (newSubtotal >= 100) {
      discountType = '10% off orders over €100';
      discountValue = 0.1;
      discountSavings = Math.round(newSubtotal * 0.1 * 10) / 10; // Round to nearest 0.1
    }
    // Example discount: 20 euro off when spending over 200
    else if (newSubtotal >= 200) {
      discountType = '€20 off orders over €200';
      discountValue = 20;
      discountSavings = 20;
    }

    setDiscount({ type: discountType, value: discountValue, savings: discountSavings });

    // Calculate final total
    setTotal(Math.round((newSubtotal - discountSavings) * 10) / 10); // Round to nearest 0.1
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};