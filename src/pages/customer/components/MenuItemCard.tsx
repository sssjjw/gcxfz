import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../../../contexts/MenuContext';
import { useCart } from '../../../contexts/CartContext';
import MenuItemDetailModal from './MenuItemDetailModal';
import MenuItemOptionModal from './MenuItemOptionModal';

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addItem, items } = useCart();
  
  // 状态管理
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  
  // 添加引用，用于获取加号按钮位置
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const itemImageRef = useRef<HTMLImageElement>(null);
  
  // 判断是否有自定义选项
  const hasCustomOptions = () => {
    return item.customOptions && item.customOptions.length > 0;
  };
  
  // 检查当前菜品在购物车中的数量（无自定义选项商品）
  useEffect(() => {
    if (!hasCustomOptions()) {
      // 对于无自定义选项商品，只计算没有variant的数量
      const totalQuantity = items
        .filter(cartItem => 
          cartItem.menuItem.id === item.id && 
          !cartItem.variant
        )
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      setQuantity(totalQuantity);
    } else {
      setQuantity(0); // 有自定义选项的商品在这里不显示数量
    }
  }, [items, item.id, hasCustomOptions]);
  
  // 价格处理
  const getMinPrice = (): number => {
    // 检查是否有定价的自定义选项
    if (item.customOptions && item.customOptions.length > 0) {
      // 查找有定价的选项组，特别是份量、杯型、数量等替换价格的选项
      for (const group of item.customOptions) {
        if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
          // 对于替换价格类型，找默认选项
          const defaultOption = group.options.find(opt => opt.isDefault);
          if (defaultOption) {
            // 如果默认选项有价格，说明是完全替换价格模式
            if (defaultOption.price !== undefined) {
              return defaultOption.price;
            } else {
              // 如果默认选项没有价格，说明是基础价格+附加费模式
              return item.price;
            }
          }
        }
      }
      
      // 查找其他有定价的默认选项
      for (const group of item.customOptions) {
        const defaultOption = group.options.find(opt => opt.isDefault && opt.price !== undefined);
        if (defaultOption && defaultOption.price !== undefined) {
          return defaultOption.price;
        }
      }
      
      // 如果没找到默认选项，找第一个有价格的选项
      for (const group of item.customOptions) {
        const priceOption = group.options.find(opt => opt.price !== undefined);
        if (priceOption && priceOption.price !== undefined) {
          if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
            return priceOption.price;
          } else {
            return item.price + priceOption.price;
          }
        }
      }
    }
    
    return item.price;
  };

  // 触发飞入购物车的动画
  const triggerFlyAnimation = () => {
    if (!addButtonRef.current || !itemImageRef.current) return;
    
    // 获取图片位置
    const imageRect = itemImageRef.current.getBoundingClientRect();
    
    // 使用图片中心作为动画起点，这样更加自然
    const startPosition = {
      x: imageRect.left + imageRect.width / 2,
      y: imageRect.top + imageRect.height / 2
    };
    
    // 创建自定义事件，传递产品图片和起始位置
    const addToCartEvent = new CustomEvent('add-to-cart', {
      detail: {
        productImage: item.imageUrl,
        position: startPosition
      }
    });
    
    // 分发事件
    window.dispatchEvent(addToCartEvent);
    
    // 添加按钮缩放动画效果
    if (addButtonRef.current) {
      addButtonRef.current.classList.add('scale-90');
      setTimeout(() => {
        if (addButtonRef.current) {
          addButtonRef.current.classList.remove('scale-90');
        }
      }, 150);
    }
  };

  // 快速添加到购物车（无规格商品）
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免打开详情弹窗
    addItem(item, 1);
    triggerFlyAnimation();
  };

  // 增加数量
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  // 减少数量
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      addItem(item, -1);
    }
  };
  
  // 打开商品详情
  const handleOpenDetail = () => {
    setShowDetailModal(true);
  };
  
  // 打开规格选择
  const handleOpenOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionModal(true);
  };

  // 渲染右侧按钮
  const renderActionButton = () => {
    if (hasCustomOptions()) {
      // 有自定义选项，显示"选择"按钮
      return (
        <button
          onClick={handleOpenOptions}
          className="rounded-md bg-orange-500 text-white px-3 py-1.5 text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          选择
        </button>
      );
    } else {
      // 无规格商品
      if (quantity === 0) {
        // 显示加号按钮
        return (
          <button
            ref={addButtonRef}
            onClick={handleQuickAdd}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-transform duration-150 shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </button>
        );
      } else {
        // 显示数量调节器
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecrement}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-medium text-gray-800 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              ref={addButtonRef}
              onClick={handleIncrement}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        );
      }
    }
  };

  return (
    <>
      <div 
        className="flex cursor-pointer items-start gap-3 border-b border-gray-100 py-4"
        onClick={handleOpenDetail}
      >
        {/* 图片 */}
        <div className="relative w-24 h-24 overflow-hidden rounded-lg">
          <img
            ref={itemImageRef}
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
        
        {/* 内容 */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 text-base mb-1">{item.name}</h3>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {item.description}
          </p>
        
          <div className="flex items-center justify-between pr-2">
            <div className="text-orange-500 font-semibold">
              €{getMinPrice().toFixed(1)}
              {hasCustomOptions() && (
                <span className="text-xs ml-0.5">起</span>
              )}
            </div>
            
            <div className="ml-4">
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
      
      {/* 商品详情弹窗 */}
      <MenuItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={item}
        onSelectOptions={() => {
          setShowDetailModal(false);
          setShowOptionModal(true);
        }}
      />
      
      {/* 规格选择弹窗 */}
      <MenuItemOptionModal
        isOpen={showOptionModal}
        onClose={() => setShowOptionModal(false)}
        item={item}
      />
    </>
  );
};

export default MenuItemCard;