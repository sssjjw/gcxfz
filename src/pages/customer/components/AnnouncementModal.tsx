import React from 'react';
import { X, Star } from 'lucide-react';
import { AnnouncementData } from './Announcement';

// 扩展公告数据接口，添加活动提醒字段
interface ExtendedAnnouncementData extends AnnouncementData {
  promotionText?: string; // 活动提醒文本
}

interface AnnouncementModalProps {
  data: AnnouncementData;
  isOpen: boolean;
  onClose: () => void;
  onOrderNow: () => void;
}

// 强制版本号，确保刷新
const MODAL_VERSION = '2.0.0';

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ 
  data, 
  isOpen, 
  onClose,
  onOrderNow
}) => {
  if (!isOpen) return null;
  
  // 将数据转换为扩展类型，以便使用可选的promotionText字段
  const extendedData = data as ExtendedAnnouncementData;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* 弹窗头部 */}
        <div className="p-4 pb-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
          <h3 className="text-xl font-bold text-white">{data.title || `📢 本周${data.orderWeekday}订餐公告`}</h3>
          <p className="text-blue-100 text-sm">
            {data.description || '请查看以下重要信息，以便顺利完成订餐'}
          </p>
        </div>
        
        {/* 弹窗内容 */}
        <div className="p-4 pt-3">
          {/* 活动提醒高亮栏目 */}
          {extendedData.promotionText && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 rounded-r-md">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1.5 flex-shrink-0" />
                <span className="font-medium text-yellow-800 text-sm">{extendedData.promotionText}</span>
              </div>
            </div>
          )}
          
          {/* 基本信息卡片 */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
            <h4 className="font-semibold text-blue-700 mb-1.5 text-sm">基本信息</h4>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="w-20 text-xs text-gray-600 mt-0.5">取餐时间：</span>
                <span className="font-medium text-gray-900 text-sm">{data.orderDate}（{data.orderWeekday}）{data.pickupTime}</span>
              </li>
              <li className="flex items-start">
                <span className="w-20 text-xs text-gray-600 mt-0.5">截单时间：</span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 text-sm">{data.orderDeadline}</span>
                  {data.specialDeadline && (
                    <span className="text-orange-500 font-medium text-xs">{data.specialDeadline}</span>
                  )}
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-20 text-xs text-gray-600 mt-0.5">取餐地点：</span>
                <span className="font-medium text-gray-900 text-sm">{data.pickupLocation}</span>
              </li>
              <li className="flex items-start">
                <span className="w-20 text-xs text-gray-600 mt-0.5">支付方式：</span>
                <span className="font-medium text-gray-900 text-sm">{data.paymentMethods.join(' / ')}</span>
              </li>
            </ul>
          </div>
          
          {/* 温馨提示 */}
          {data.tips.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <h4 className="font-semibold text-amber-700 mb-1 text-sm">温馨提示</h4>
              <ul className="space-y-0.5">
                {data.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-4 w-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center mr-1.5 mt-0.5 font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-xs">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 操作按钮 - 硬编码为只有一个大的"去点餐"按钮 */}
          <div className="mt-3 flex justify-center">
            <button 
              onClick={onOrderNow}
              className="w-full px-4 py-2.5 bg-orange-500 text-white font-medium rounded-md text-sm shadow-sm hover:bg-orange-600 transition-colors"
            >
              去点餐
            </button>
          </div>
          
          {/* 版本标记 - 隐藏 */}
          <div className="hidden">{MODAL_VERSION}</div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal; 