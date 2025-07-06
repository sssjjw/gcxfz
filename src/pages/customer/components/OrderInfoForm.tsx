import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';

interface OrderInfoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupName: string, notes?: string) => void;
}

const OrderInfoForm: React.FC<OrderInfoFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { items, subtotal, discount, total } = useCart();
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('请输入群昵称');
      return;
    }
    
    setError('');
    onSubmit(groupName.trim(), notes.trim() || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Form Panel */}
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">订单信息</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 群昵称输入 */}
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                群昵称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="请输入您的群昵称"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
              )}
            </div>
            
            {/* 备注输入 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                备注（可选）
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="请输入备注信息（如特殊要求等）"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
            </div>
            
            {/* 订单摘要 */}
            <div className="rounded-lg bg-gray-50 p-3">
              <h3 className="text-sm font-medium text-gray-800 mb-3">订单摘要</h3>
              <div className="space-y-3">
                {items.map((item) => {
                  // 使用预计算价格或计算实际价格
                  let unitPrice = item.calculatedPrice !== undefined ? item.calculatedPrice : item.menuItem.price;
                  
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
                            unitPrice += option.price;
                          } else {
                            // 完全替换价格模式：用选项价格替换基础价格
                            unitPrice = option.price;
                          }
                        } else {
                          // 其他类型的选项都是附加费
                          unitPrice += option.price;
                        }
                        break;
                      }
                    }
                  }
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      {/* 菜品基本信息 */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.menuItem.name}</h4>
                          <p className="text-xs text-gray-600">单价: €{unitPrice.toFixed(1)} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">€{(unitPrice * item.quantity).toFixed(1)}</p>
                        </div>
                      </div>
                      
                      {/* 规格详情 */}
                      {(item.variant || item.special) && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          {item.variant && item.variant.trim() !== '' && (
                            <div className="mb-1">
                              <span className="text-xs text-gray-500">规格: </span>
                              <span className="text-xs text-gray-700">{item.variant}</span>
                            </div>
                          )}
                          {item.special && item.special.trim() !== '' && (
                            <div>
                              <span className="text-xs text-gray-500">选项: </span>
                              <span className="text-xs text-gray-700">{item.special}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 space-y-1 border-t border-gray-200 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">小计</span>
                  <span className="font-medium">€{subtotal.toFixed(1)}</span>
                </div>
                
                {discount.type && (
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">{discount.type}</span>
                    <span className="font-medium text-green-600">-€{discount.savings.toFixed(1)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1">
                  <span>总计</span>
                  <span className="text-orange-600">€{total.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer with submit button */}
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={handleSubmit}
            className="w-full rounded-full bg-orange-500 py-3 text-center font-semibold text-white transition-colors hover:bg-orange-600"
          >
            提交订单
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoForm; 