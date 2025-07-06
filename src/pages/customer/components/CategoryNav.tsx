import React from 'react';
import { Category } from '../../../contexts/MenuContext';
import { Megaphone } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryClick: (id: string) => void;
  onAnnouncementClick?: () => void;
  showAnnouncement?: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryClick,
  onAnnouncementClick,
  showAnnouncement = true
}) => {
  return (
    <nav className="py-4">
      <ul className="flex flex-col space-y-1">
        {/* 特殊的公告菜单条目 */}
        {showAnnouncement && (
          <li className="mb-2">
            <button
              onClick={onAnnouncementClick}
              className="w-full px-4 py-3 text-center text-sm transition-all md:text-left md:text-base
                bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 
                text-blue-700 hover:from-blue-100 hover:to-blue-200 font-medium rounded-r-lg"
            >
              <div className="flex items-center justify-center md:justify-start">
                <Megaphone className="h-4 w-4 mr-2 text-blue-600" />
                <span>公告信息</span>
              </div>
            </button>
          </li>
        )}
        
        {/* 分类条目 */}
        {categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryClick(category.id)}
                className={`w-full px-4 py-3 text-center text-sm transition-all md:text-left md:text-base ${
                  selectedCategory === category.id
                    ? 'bg-orange-50 font-medium text-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;