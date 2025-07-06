import React from 'react';
import { MenuItem, Category } from '../../../contexts/MenuContext';
import MenuItemCard from './MenuItemCard';
import { Utensils } from 'lucide-react'; // 导入餐具图标

interface MenuListProps {
  menuItems: MenuItem[];
  categories: Category[];
  categoryRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const MenuList: React.FC<MenuListProps> = ({ menuItems, categories, categoryRefs }) => {
  // Group menu items by category
  const itemsByCategory: { [key: string]: MenuItem[] } = {};
  
  menuItems.forEach((item) => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    if (item.available) {
      itemsByCategory[item.category].push(item);
    }
  });

  // 为每个分类生成渐变色
  const getCategoryColor = (index: number) => {
    const colors = [
      'from-orange-500 to-amber-400', // 橙色渐变
      'from-emerald-500 to-teal-400', // 绿色渐变
      'from-blue-500 to-cyan-400',    // 蓝色渐变
      'from-purple-500 to-violet-400' // 紫色渐变
    ];
    return colors[index % colors.length];
  };



  return (
    <div className="pb-4">
      {categories
        .sort((a, b) => a.order - b.order)
        .map((category, index) => (
          <div
            key={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="mb-6 pt-4 scroll-mt-20"
          >
            <div className="relative mb-4">
              {/* 标题容器 */}
              <div className="flex items-center py-2 px-4">
                {/* 图标 */}
                <div className={`flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r ${getCategoryColor(index)} shadow-md mr-2`}>
                  <Utensils className="h-3 w-3 text-white" />
                </div>
                
                {/* 标题文字 */}
                <h2 className="text-base font-bold text-gray-800">
              {category.name}
            </h2>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              {itemsByCategory[category.id]?.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            
            {(!itemsByCategory[category.id] || itemsByCategory[category.id].length === 0) && (
                <p className="text-center text-gray-500 py-4">该分类暂无菜品</p>
            )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MenuList;