import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, updateItemQuantity, removeItem, subtotal, discount, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">购物车</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium text-gray-600">购物车是空的</p>
              <p className="mt-1 text-sm text-gray-500">添加一些美味的菜品开始点餐吧！</p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                去点餐
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                // 计算实际价格，优先使用预计算价格
                let price = item.calculatedPrice !== undefined ? item.calculatedPrice : item.menuItem.price;
                
                // 如果没有预计算价格且有variant信息，尝试从自定义选项中找到对应价格
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
                
                return (
                  <li 
                    key={item.id} 
                    className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3"
                  >
                    {/* Item Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Item Content */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-800">
                          {item.menuItem.name}
                        </h3>
                        <p className="text-sm font-medium text-gray-700">
                          €{(price * item.quantity).toFixed(1)}
                        </p>
                      </div>
                      
                      {item.variant && item.variant.trim() !== '' && (
                        <p className="mt-1 text-xs text-gray-500">
                          规格：{item.variant}
                        </p>
                      )}
                      
                      {item.special && item.special.trim() !== '' && (
                        <p className="mt-1 text-xs text-gray-500">
                          备注：{item.special}
                        </p>
                      )}
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <span className="text-lg leading-none">-</span>
                          </button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer with total and checkout button */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小计</span>
                <span className="font-medium">€{subtotal.toFixed(1)}</span>
              </div>
              
              {discount.type && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{discount.type}</span>
                  <span className="font-medium text-green-600">-€{discount.savings.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
                <span>总计</span>
                <span className="text-orange-600">€{total.toFixed(1)}</span>
              </div>
            </div>
            
            <button
              onClick={onCheckout}
              className="mt-4 w-full rounded-full bg-orange-500 py-3 text-center font-semibold text-white transition-colors hover:bg-orange-600"
            >
              去结算
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;