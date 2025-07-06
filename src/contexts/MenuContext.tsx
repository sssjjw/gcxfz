import React, { createContext, useState, useContext, useEffect } from 'react';

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

// 从localStorage加载菜单数据
const loadMenuDataFromStorage = () => {
  try {
    const menuItemsJson = localStorage.getItem('menuItems');
    const categoriesJson = localStorage.getItem('categories');
    
    return {
      menuItems: menuItemsJson ? JSON.parse(menuItemsJson) : sampleMenuItems,
      categories: categoriesJson ? JSON.parse(categoriesJson) : sampleCategories
    };
  } catch (error) {
    console.error('加载菜单数据失败:', error);
    return { menuItems: sampleMenuItems, categories: sampleCategories };
  }
};

// 保存菜单数据到localStorage
const saveMenuDataToStorage = (menuItems: MenuItem[], categories: Category[]) => {
  try {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // 发送自定义事件通知其他组件
    const menuUpdateEvent = new CustomEvent('menuUpdate', { 
      detail: { menuItems, categories } 
    });
    window.dispatchEvent(menuUpdateEvent);
  } catch (error) {
    console.error('保存菜单数据失败:', error);
  }
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从localStorage加载初始数据，如果没有则使用默认样本数据
  const initialData = loadMenuDataFromStorage();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialData.menuItems);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);

  // 当菜单数据变化时保存到localStorage
  useEffect(() => {
    saveMenuDataToStorage(menuItems, categories);
  }, [menuItems, categories]);

  // 模拟初始加载效果
  useEffect(() => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to load menu data');
      setIsLoading(false);
    }
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

  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prevItems) => [...prevItems, item]);
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === id ? { ...prevItem, ...item } : prevItem
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const addCategory = (category: Category) => {
    setCategories((prevCategories) => [...prevCategories, category]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories((prevCategories) =>
      prevCategories.map((prevCategory) =>
        prevCategory.id === id ? { ...prevCategory, ...category } : prevCategory
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== id)
    );
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