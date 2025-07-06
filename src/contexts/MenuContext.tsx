import React, { createContext, useState, useContext, useEffect } from 'react';
import { menuService, settingsService } from '../firebase/services';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
  customOptions?: {
    type: string;
    title: string;
    required?: boolean;
    options: { 
      id: string;
      name: string;
      price?: number;
      isDefault?: boolean;
    }[];
  }[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

interface MenuContextType {
  menuItems: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Sample data
const sampleCategories: Category[] = [
  { id: '1', name: '热销榜', order: 1 },
  { id: '2', name: '米饭套餐', order: 2 },
  { id: '3', name: '小吃点心', order: 3 },
  { id: '4', name: '饮料', order: 4 },
];

const sampleMenuItems: MenuItem[] = [
  {
    id: '1',
    name: '黄焖鸡米饭',
    description: '经典黄焖鸡，搭配米饭，口感鲜美',
    price: 19.5,
    imageUrl: 'https://images.pexels.com/photos/7593230/pexels-photo-7593230.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '1',
    available: true,
    customOptions: [
      {
        type: 'size',
        title: '份量',
        required: true,
        options: [
          { id: 'small', name: '小份', isDefault: true },
          { id: 'large', name: '大份', price: 6.0 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '回锅肉套餐',
    description: '香辣可口的回锅肉，搭配新鲜蔬菜和米饭',
    price: 26.0,
    imageUrl: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '2',
    available: true,
    customOptions: [
      {
        type: 'spicy',
        title: '辣度',
        required: false,
        options: [
          { id: 'mild', name: '微辣', isDefault: true },
          { id: 'medium', name: '中辣' },
          { id: 'hot', name: '重辣' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: '水煮鱼片',
    description: '麻辣鲜香的水煮鱼片，搭配新鲜青菜',
    price: 32.0,
    imageUrl: 'https://images.pexels.com/photos/5836771/pexels-photo-5836771.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '2',
    available: true,
    customOptions: [
      {
        type: 'spicy',
        title: '辣度',
        required: false,
        options: [
          { id: 'medium', name: '正常辣', isDefault: true },
          { id: 'hot', name: '重辣' },
          { id: 'extra-hot', name: '特辣' }
        ]
      }
    ]
  },
  {
    id: '4',
    name: '煎饺',
    description: '外脆里嫩，精选猪肉馅料',
    price: 15.0,
    imageUrl: 'https://images.pexels.com/photos/5908252/pexels-photo-5908252.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '3',
    available: true,
    customOptions: [
      {
        type: 'size',
        title: '份量',
        required: true,
        options: [
          { id: 'small', name: '小份(6个)', isDefault: true },
          { id: 'large', name: '大份(12个)', price: 3.0 }
        ]
      }
    ]
  },
  {
    id: '5',
    name: '凉拌黄瓜',
    description: '清脆爽口的黄瓜，配以特制调味料',
    price: 12.0,
    imageUrl: 'https://images.pexels.com/photos/6341409/pexels-photo-6341409.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '3',
    available: true,
    customOptions: [
      {
        type: 'spicy',
        title: '口味',
        required: false,
        options: [
          { id: 'normal', name: '原味', isDefault: true },
          { id: 'spicy', name: '麻辣味', price: 1.0 }
        ]
      }
    ]
  },
  {
    id: '6',
    name: '奶茶',
    description: '醇香奶茶，口感丰富',
    price: 10.0,
    imageUrl: 'https://images.pexels.com/photos/4887880/pexels-photo-4887880.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '4',
    available: true,
    customOptions: [
      {
        type: 'size',
        title: '杯型',
        required: true,
        options: [
          { id: 'medium', name: '中杯', isDefault: true },
          { id: 'large', name: '大杯', price: 2.0 }
        ]
      },
      {
        type: 'ice',
        title: '冰量',
        required: false,
        options: [
          { id: 'normal', name: '正常冰', isDefault: true },
          { id: 'less', name: '少冰' },
          { id: 'no', name: '去冰' }
        ]
      },
      {
        type: 'sugar',
        title: '甜度',
        required: false,
        options: [
          { id: 'normal', name: '正常甜', isDefault: true },
          { id: 'half', name: '半糖' },
          { id: 'less', name: '微糖' },
          { id: 'no', name: '无糖' }
        ]
      }
    ]
  },
  {
    id: '7',
    name: '柠檬水',
    description: '新鲜柠檬制作，酸甜清爽',
    price: 8.0,
    imageUrl: 'https://images.pexels.com/photos/4021983/pexels-photo-4021983.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '4',
    available: true,
    customOptions: [
      {
        type: 'size',
        title: '杯型',
        required: true,
        options: [
          { id: 'small', name: '小杯', isDefault: true },
          { id: 'large', name: '大杯', price: 2.0 }
        ]
      },
      {
        type: 'ice',
        title: '冰量',
        required: false,
        options: [
          { id: 'normal', name: '正常冰', isDefault: true },
          { id: 'less', name: '少冰' },
          { id: 'no', name: '常温' }
        ]
      },
      {
        type: 'extra',
        title: '加料',
        required: false,
        options: [
          { id: 'mint', name: '薄荷叶', price: 1.0 },
          { id: 'honey', name: '蜂蜜', price: 1.5 },
          { id: 'none', name: '不加料', isDefault: true }
        ]
      }
    ]
  },
  {
    id: '8',
    name: '宫保鸡丁',
    description: '传统川菜，麻辣鲜香，搭配米饭',
    price: 24.0,
    imageUrl: 'https://images.pexels.com/photos/7353379/pexels-photo-7353379.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: '2',
    available: true,
    customOptions: [
      {
        type: 'spicy',
        title: '辣度',
        required: false,
        options: [
          { id: 'mild', name: '微辣', isDefault: true },
          { id: 'medium', name: '中辣' },
          { id: 'hot', name: '重辣' }
        ]
      }
    ]
  },
];

// 从Firebase加载菜单数据
const loadMenuDataFromFirebase = async () => {
  try {
    console.log('🔄 正在从Firebase加载菜单数据...');
    
    // 从Firebase加载数据
    const [firebaseMenuItems, firebaseCategories] = await Promise.all([
      menuService.getAllMenuItems(),
      settingsService.getSetting('categories')
    ]);
    
    if (firebaseMenuItems && firebaseMenuItems.length > 0) {
      console.log('✅ 从Firebase加载了菜单数据:', firebaseMenuItems.length, '个菜品');
      return {
        menuItems: firebaseMenuItems,
        categories: firebaseCategories || sampleCategories
      };
    }
    
    // Firebase没有数据，自动初始化示例数据
    console.log('⚠️ Firebase没有菜单数据，正在初始化示例数据...');
    try {
      // 初始化菜品数据
      for (const item of sampleMenuItems) {
        await menuService.createMenuItem(item);
      }
      // 初始化分类数据
      await settingsService.setSetting('categories', sampleCategories);
      console.log('✅ 示例菜单数据初始化成功');
      
      return {
        menuItems: sampleMenuItems,
        categories: sampleCategories
      };
    } catch (error) {
      console.error('❌ 初始化示例数据失败:', error);
      return { menuItems: sampleMenuItems, categories: sampleCategories };
    }
  } catch (error) {
    console.error('❌ 加载菜单数据失败:', error);
    // 返回示例数据作为最后的回退
    return { menuItems: sampleMenuItems, categories: sampleCategories };
  }
};

// 保存菜单数据到Firebase
const saveMenuDataToFirebase = async (categories: Category[]) => {
  try {
    // 保存到Firebase
    await settingsService.setSetting('categories', categories);
    console.log('✅ 分类数据已保存到Firebase');
    
    // 发送自定义事件通知其他组件
    const menuUpdateEvent = new CustomEvent('menuUpdate', { 
      detail: { categories } 
    });
    window.dispatchEvent(menuUpdateEvent);
  } catch (error) {
    console.error('❌ 保存分类数据到Firebase失败:', error);
  }
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化为空数组，数据将在useEffect中异步加载
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 当分类数据变化时保存到Firebase
  useEffect(() => {
    // 只有当数据不为空时才保存
    if (categories.length > 0) {
      saveMenuDataToFirebase(categories);
    }
  }, [categories]);

  // 异步加载菜单数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await loadMenuDataFromFirebase();
        setMenuItems(data.menuItems);
        setCategories(data.categories);
      } catch (err) {
        console.error('加载菜单数据失败:', err);
        setError('加载菜单数据失败');
        // 使用默认数据
        setMenuItems(sampleMenuItems);
        setCategories(sampleCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 监听其他组件触发的菜单数据更新事件
  useEffect(() => {
    const handleMenuUpdate = (e: CustomEvent<{menuItems: MenuItem[], categories: Category[]}>) => {
      if (e.detail) {
        // 只有当数据真正发生变化时才更新状态
        const { menuItems: newMenuItems, categories: newCategories } = e.detail;
        
        if (JSON.stringify(menuItems) !== JSON.stringify(newMenuItems)) {
          setMenuItems(newMenuItems);
        }
        
        if (JSON.stringify(categories) !== JSON.stringify(newCategories)) {
          setCategories(newCategories);
        }
      }
    };

    window.addEventListener('menuUpdate', handleMenuUpdate as EventListener);
    return () => {
      window.removeEventListener('menuUpdate', handleMenuUpdate as EventListener);
    };
  }, [menuItems, categories]);

  const addMenuItem = async (item: MenuItem) => {
    try {
      // 保存到Firebase
      await menuService.createMenuItem(item);
      console.log('✅ 菜品已添加到Firebase:', item.name);
      
      // 更新本地状态
      setMenuItems((prevItems) => [...prevItems, item]);
    } catch (error) {
      console.error('❌ 添加菜品到Firebase失败:', error);
      // 即使Firebase失败，也更新本地状态
      setMenuItems((prevItems) => [...prevItems, item]);
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      // 保存到Firebase
      await menuService.updateMenuItem(id, item);
      console.log('✅ 菜品已更新到Firebase:', id);
      
      // 更新本地状态
      setMenuItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === id ? { ...prevItem, ...item } : prevItem
        )
      );
    } catch (error) {
      console.error('❌ 更新菜品到Firebase失败:', error);
      // 即使Firebase失败，也更新本地状态
      setMenuItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === id ? { ...prevItem, ...item } : prevItem
        )
      );
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      // 从Firebase删除
      await menuService.deleteMenuItem(id);
      console.log('✅ 菜品已从Firebase删除:', id);
      
      // 更新本地状态
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error('❌ 从Firebase删除菜品失败:', error);
      // 即使Firebase失败，也更新本地状态
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const addCategory = async (category: Category) => {
    try {
      // 更新本地状态
      const newCategories = [...categories, category];
      setCategories(newCategories);
      console.log('✅ 分类已添加:', category.name);
    } catch (error) {
      console.error('❌ 添加分类失败:', error);
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      // 更新本地状态
      const newCategories = categories.map((prevCategory) =>
        prevCategory.id === id ? { ...prevCategory, ...category } : prevCategory
      );
      setCategories(newCategories);
      console.log('✅ 分类已更新:', id);
    } catch (error) {
      console.error('❌ 更新分类失败:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // 更新本地状态
      const newCategories = categories.filter((category) => category.id !== id);
      setCategories(newCategories);
      console.log('✅ 分类已删除:', id);
    } catch (error) {
      console.error('❌ 删除分类失败:', error);
    }
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        categories,
        isLoading,
        error,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};