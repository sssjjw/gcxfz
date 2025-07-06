import React from 'react';
import { Calendar, Clock, MapPin, DollarSign, Utensils, AlertCircle, Star } from 'lucide-react';

// 定义公告内容的接口，方便后台修改
export interface AnnouncementData {
  isEnabled: boolean;
  orderDate: string;
  orderWeekday: string;
  pickupTime: string;
  orderDeadline: string;
  specialDeadline?: string;
  pickupLocation: string;
  paymentMethods: string[];
  tips: string[];
  promotionText?: string; // 活动提醒文本
  title?: string; // 公告标题
  description?: string; // 公告描述
}

// 默认公告数据
export const defaultAnnouncementData: AnnouncementData = {
  isEnabled: true,
  orderDate: '5.22',
  orderWeekday: '周四',
  pickupTime: '18:00',
  orderDeadline: '5.22（周四）12:00',
  specialDeadline: '甜品截至5.21晚10点',
  pickupLocation: '蓝塔楼下',
  paymentMethods: ['现金', 'PayPal'],
  promotionText: '本周特惠: 三份餐点八折优惠！单点饮料第二杯半价！',
  title: '📢 本周周五订餐公告',
  description: '请查看以下重要信息，以便顺利完成订餐',
  tips: [
    '考虑有同学课前用餐，为方便外带食用，现提供一次性餐具（筷子 / 勺叉）！',
    '下单时备注或私信群主，随时随地享受美味～'
  ]
};

interface AnnouncementProps {
  data: AnnouncementData;
  onClose: () => void;
}

const Announcement: React.FC<AnnouncementProps> = ({ data, onClose }) => {
  if (!data.isEnabled) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-3 mb-3 relative rounded-r-lg shadow-sm">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <span className="sr-only">关闭</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* 标题 */}
      <div className="flex items-center text-blue-700 font-bold mb-1.5">
        <AlertCircle className="h-4 w-4 mr-1.5 text-blue-600" />
        <h3 className="text-sm">{data.title}</h3>
      </div>

      {/* 活动提醒 */}
      {data.promotionText && (
        <div className="bg-yellow-50 border-l-2 border-yellow-400 p-1.5 mb-1.5 ml-6 rounded-r-md">
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 flex-shrink-0" />
            <span className="text-xs font-medium text-yellow-800">{data.promotionText}</span>
          </div>
        </div>
      )}
      
      {/* 基本信息部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-gray-700 ml-6 mb-1.5">
        <div className="flex items-start">
          <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>取餐时间：<span className="font-medium">{data.orderDate}（{data.orderWeekday}）{data.pickupTime}</span></span>
        </div>
        <div className="flex items-start flex-col">
          <div className="flex items-start">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              截单时间：<span className="font-medium">{data.orderDeadline}</span>
            </span>
          </div>
          {data.specialDeadline && (
            <div className="ml-5 mt-0.5">
              <span className="text-orange-500 font-medium text-xs">{data.specialDeadline}</span>
            </div>
          )}
        </div>
        <div className="flex items-start">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>取餐点：<span className="font-medium">{data.pickupLocation}</span></span>
        </div>
        <div className="flex items-start">
          <DollarSign className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>支付方式：<span className="font-medium">{data.paymentMethods.join(' / ')}</span></span>
        </div>
      </div>
      
      {/* 温馨提示部分 */}
      {data.tips.length > 0 && (
        <div className="ml-6 mt-1 bg-white p-2 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center mb-1 text-blue-700 font-medium">
            <Utensils className="h-3.5 w-3.5 mr-1 text-blue-600" />
            <span className="text-xs">温馨提示</span>
          </div>
          <ul className="space-y-0.5">
            {data.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-1.5 mt-0.5 font-bold">{index + 1}</span>
                <span className="text-gray-600 text-xs">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Announcement; 