import React from 'react';
import { X } from 'lucide-react';
import { MenuItem } from '../../../contexts/MenuContext';

interface MenuItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
  onSelectOptions: () => void;
}

const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onSelectOptions
}) => {
  if (!isOpen) return null;
  


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-auto rounded-xl bg-white">
        {/* 顶部图片 */}
        <div className="relative h-80 w-full">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="h-full w-full object-cover"
          />
          
          {/* 关闭按钮 */}
          <button 
            className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-black bg-opacity-40 text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 商品信息 */}
        <div className="p-4">
          {/* 标题 */}
          <div className="mb-3">
            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
          </div>
          
          {/* 描述 */}
          <div className="mb-3 text-gray-600">
            <p>{item.description}</p>
          </div>
          

          
          {/* 购买按钮 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-orange-500">€{item.price.toFixed(1)}</span>
              {item.customOptions && item.customOptions.length > 0 && (
                <span className="ml-1 text-sm text-gray-400">起</span>
              )}
            </div>
            
            <button
              onClick={onSelectOptions}
              className="rounded-full bg-orange-500 px-6 py-2 text-white shadow-md hover:bg-orange-600"
            >
              选规格
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal; 