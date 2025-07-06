import React from 'react';
import { Check, X } from 'lucide-react';
import { Order } from '../../../contexts/OrderContext';

interface OrderConfirmationProps {
  order: Order;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative mx-auto max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">订单已提交</h3>
          <p className="mt-2 text-gray-600">
            您的订单已成功提交，请留意取餐码
          </p>
        </div>
        
        {/* Group Name and Pickup Code */}
        <div className="mt-6 space-y-4">
          {/* 群昵称 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">群昵称</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{order.groupName || '未填写'}</p>
          </div>
          
          {/* 取餐码 */}
          <div className="flex justify-center">
            <div className="rounded-lg bg-orange-50 px-8 py-6 text-center">
              <p className="text-sm font-medium text-orange-800">取餐码</p>
              <p className="mt-2 text-4xl font-bold tracking-wide text-orange-600">
                {order.pickupCode}
              </p>
              <p className="mt-1 text-xs text-orange-700">
                请向店员出示此码或报群昵称
              </p>
            </div>
          </div>
          
          {/* 备注 */}
          {order.notes && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">备注</p>
              <p className="mt-1 text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-base font-semibold text-gray-900">订单详情</h4>
          
          <div className="mt-4 space-y-4">
            {order.items.map((item, index) => {
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
                <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-white">
                  {/* 菜品基本信息 */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.menuItem.name}</h5>
                      <p className="text-sm text-gray-600">单价: €{unitPrice.toFixed(1)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">€{(unitPrice * item.quantity).toFixed(1)}</p>
                    </div>
                  </div>
                  
                  {/* 选项详情 */}
                  {(item.variant || item.special) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {item.variant && item.variant.trim() !== '' && (
                        <div className="mb-1">
                          <span className="text-xs text-gray-500">规格选择: </span>
                          <span className="text-xs text-gray-700">{item.variant}</span>
                        </div>
                      )}
                      {item.special && item.special.trim() !== '' && (
                        <div>
                          <span className="text-xs text-gray-500">详细选项: </span>
                          <span className="text-xs text-gray-700">{item.special}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 价格汇总 */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">商品小计</span>
              <span className="font-medium">€{order.subtotal.toFixed(1)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">优惠金额</span>
                <span className="font-medium text-green-600">-€{order.discount.toFixed(1)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span>订单总计</span>
              <span className="text-orange-600">€{order.total.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-orange-500 py-3 text-center font-medium text-white transition-all hover:bg-orange-600"
          >
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;