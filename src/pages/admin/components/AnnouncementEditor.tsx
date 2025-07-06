import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Star } from 'lucide-react';
import { AnnouncementData, defaultAnnouncementData } from '../../customer/components/Announcement';

interface AnnouncementEditorProps {
  initialData?: AnnouncementData;
  onSave: (data: AnnouncementData) => void;
}

const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({ 
  initialData = defaultAnnouncementData,
  onSave 
}) => {
  const [announcementData, setAnnouncementData] = useState<AnnouncementData>(initialData);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newTip, setNewTip] = useState('');
  const [specialDeadlinePrefix, setSpecialDeadlinePrefix] = useState(() => {
    if (announcementData.specialDeadline) {
      const match = announcementData.specialDeadline.match(/^(.*?)(\d+\.\d+)/);
      return match ? match[1] : "甜品截至";
    }
    return "甜品截至";
  });
  
  // 添加一个预览数据状态，确保预览与编辑同步
  const [previewData, setPreviewData] = useState<AnnouncementData>(announcementData);
  
  // 添加一个更新计数器，强制组件重新渲染
  const [updateCounter, setUpdateCounter] = useState(0);
  const announcementDataRef = useRef(announcementData);

  // 创建一个专门更新预览的函数
  const updatePreview = () => {
    setPreviewData({...announcementData});
    setUpdateCounter(prev => prev + 1);
  };

  // 每当announcementData变化时更新预览数据
  useEffect(() => {
    // 使用ref比较检查是否真的变化了
    if (JSON.stringify(announcementDataRef.current) !== JSON.stringify(announcementData)) {
      announcementDataRef.current = announcementData;
      updatePreview();
    }
  }, [announcementData]);

  // 包装setAnnouncementData，确保每次更新后都更新预览
  const updateAnnouncementData = (newData: AnnouncementData | ((prev: AnnouncementData) => AnnouncementData)) => {
    setAnnouncementData(newData);
    // 在下一个微任务中触发预览更新，确保数据已经更新
    Promise.resolve().then(() => {
      updatePreview();
    });
  };

  // 组件挂载后强制同步一次
  useEffect(() => {
    // 初始同步
    updatePreview();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(announcementData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof AnnouncementData
  ) => {
    const newData = {
      ...announcementData,
      [field]: e.target.value
    };
    updateAnnouncementData(newData);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAnnouncementData({
      ...announcementData,
      isEnabled: e.target.checked
    });
  };

  const handleDateChange = (date: string) => {
    // 从日期提取月日，如：从2023-05-22提取5.22
    try {
      // 直接使用输入的日期字符串处理，避免时区问题
      const [year, month, day] = date.split('-').map(num => parseInt(num));
      const formattedDate = `${month}.${day}`;
      
      // 创建日期对象用于确定星期几
      // 使用month-1是因为JS Date月份是0-11
      const dateObj = new Date(year, month - 1, day);
      const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekday = weekdayNames[dateObj.getDay()];
      
      // 更新订餐日期
      updateAnnouncementData({
        ...announcementData,
        orderDate: formattedDate,
        orderWeekday: weekday
      });
      
      // 同时更新截单时间的默认日期（默认与订餐日期相同）
      updateDeadlineDate(year, month, day);
      
      // 更新特殊截单时间的默认日期（默认比订餐日期提前一天）
      updateSpecialDeadlineDate(year, month, day);

      // 强制更新预览
      updatePreview();
    } catch (error) {
      console.error("日期解析错误", error);
    }
  };

  const updateDeadlineDate = (year: number, month: number, day: number) => {
    try {
      // 格式化日期
      const formattedDate = `${month}.${day}`;
      
      // 获取星期几
      const dateObj = new Date(year, month - 1, day);
      const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekday = weekdayNames[dateObj.getDay()];
      
      // 保留原有的时间部分，或使用默认值12:00
      let timeStr = "12:00";
      if (announcementData.orderDeadline) {
        const timePart = announcementData.orderDeadline.match(/\d{1,2}:\d{2}$/);
        if (timePart) {
          timeStr = timePart[0];
        }
      }
      
      // 更新截单时间
      updateAnnouncementData(prev => ({
        ...prev,
        orderDeadline: `${formattedDate}（${weekday}）${timeStr}`
      }));
    } catch (error) {
      console.error("更新截单日期错误", error);
    }
  };

  const updateSpecialDeadlineComplete = (prefix: string, date?: string, time?: string) => {
    try {
      // 获取当前的日期部分
      let datePart = "";
      if (date) {
        datePart = date;
      } else if (announcementData.specialDeadline) {
        const dateMatch = announcementData.specialDeadline.match(/(\d+\.\d+)/);
        datePart = dateMatch ? dateMatch[0] : "";
      }

      // 获取当前的时间部分
      let timePart = "";
      if (time) {
        timePart = time;
      } else if (announcementData.specialDeadline) {
        const timeMatch = announcementData.specialDeadline.match(/(\d{1,2}:\d{2})/);
        timePart = timeMatch ? timeMatch[0] : "";
      }

      // 如果没有日期或时间，使用默认值
      if (!datePart) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const month = yesterday.getMonth() + 1;
        const day = yesterday.getDate();
        datePart = `${month}.${day}`;
      }

      if (!timePart) {
        timePart = "22:00";
      }

      // 更新特殊截单时间
      const newSpecialDeadline = `${prefix}${datePart}晚${timePart}`;
      updateAnnouncementData(prev => ({
        ...prev,
        specialDeadline: newSpecialDeadline
      }));
    } catch (error) {
      console.error("更新特殊截单时间错误", error);
    }
  };

  const updateSpecialDeadlineDate = (year: number, month: number, day: number) => {
    try {
      // 创建日期对象并减去一天
      const dateObj = new Date(year, month - 1, day);
      dateObj.setDate(dateObj.getDate() - 1);
      
      // 获取前一天的月和日
      const prevMonth = dateObj.getMonth() + 1;
      const prevDay = dateObj.getDate();
      
      // 格式化日期
      const formattedDate = `${prevMonth}.${prevDay}`;
      
      // 更新特殊截单时间，整合前缀和日期
      updateSpecialDeadlineComplete(specialDeadlinePrefix, formattedDate);
    } catch (error) {
      console.error("更新特殊截单日期错误", error);
    }
  };

  const handleTimeChange = (time: string) => {
    // 将时间从HH:MM格式转换为常用的显示格式HH:MM
    try {
      const formattedTime = time.replace(/:/g, ':');
      updateAnnouncementData({
        ...announcementData,
        pickupTime: formattedTime
      });
    } catch (error) {
      console.error("时间格式化错误", error);
    }
  };

  // 将时间格式转换为input[type="time"]支持的格式
  const formatTimeForInput = (time: string) => {
    try {
      // 如果已经是HH:MM格式，直接返回
      if (time.includes(':')) {
        return time;
      }
      
      // 如果是格式如"18:00"，转为"18:00"
      if (time.length >= 4) {
        const hours = time.slice(0, 2);
        const minutes = time.slice(2, 4);
        return `${hours}:${minutes}`;
      }
    } catch (error) {
      console.error("时间格式化错误", error);
    }
    
    // 默认返回当前时间
    return "18:00";
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      updateAnnouncementData({
        ...announcementData,
        paymentMethods: [...announcementData.paymentMethods, newPaymentMethod.trim()]
      });
      setNewPaymentMethod('');
    }
  };

  const removePaymentMethod = (index: number) => {
    const newMethods = [...announcementData.paymentMethods];
    newMethods.splice(index, 1);
    updateAnnouncementData({
      ...announcementData,
      paymentMethods: newMethods
    });
  };

  const addTip = () => {
    if (newTip.trim()) {
      updateAnnouncementData({
        ...announcementData,
        tips: [...announcementData.tips, newTip.trim()]
      });
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    const newTips = [...announcementData.tips];
    newTips.splice(index, 1);
    updateAnnouncementData({
      ...announcementData,
      tips: newTips
    });
  };

  // 获取当前日期的YYYY-MM-DD格式
  const getCurrentDateForInput = () => {
    try {
      // 尝试从orderDate解析日期
      if (announcementData.orderDate) {
        const [month, day] = announcementData.orderDate.split('.');
        if (month && day) {
          const currentYear = new Date().getFullYear();
          // 不使用Date对象，直接手动格式化避免时区问题
          const monthPadded = String(parseInt(month)).padStart(2, '0');
          const dayPadded = String(parseInt(day)).padStart(2, '0');
          return `${currentYear}-${monthPadded}-${dayPadded}`;
        }
      }
    } catch (error) {
      console.error("日期格式化错误", error);
    }
    
    // 默认返回今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDeadlineTimeChange = (time: string) => {
    try {
      // 保留原有的日期部分
      const datePart = announcementData.orderDeadline.replace(/\d{1,2}:\d{2}$/, '');
      
      // 更新截单时间
      updateAnnouncementData(prev => ({
        ...prev,
        orderDeadline: `${datePart}${time}`
      }));
    } catch (error) {
      console.error("更新截单时间错误", error);
    }
  };

  const handleSpecialDeadlineTimeChange = (time: string) => {
    try {
      // 更新特殊截单时间，整合时间部分
      updateSpecialDeadlineComplete(specialDeadlinePrefix, undefined, time);
      // 强制更新预览
      updatePreview(); 
    } catch (error) {
      console.error("更新特殊截单时间错误", error);
    }
  };

  const extractTimeFromDeadline = (deadline: string) => {
    try {
      const timeMatch = deadline.match(/(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      }
    } catch (error) {
      console.error("提取时间错误", error);
    }
    
    return "12:00"; // 默认返回12:00
  };

  const extractTimeFromSpecialDeadline = (specialDeadline: string | undefined) => {
    try {
      if (specialDeadline) {
        const timeMatch = specialDeadline.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        }
      }
    } catch (error) {
      console.error("提取特殊截单时间错误", error);
    }
    
    return "22:00"; // 默认返回22:00
  };

  // 添加一个包装处理函数，确保同步
  const handleSpecialDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [, month, day] = e.target.value.split('-').map(num => parseInt(num));
    const formattedDate = `${month}.${day}`;
    // 更新特殊截单时间，整合日期部分
    updateSpecialDeadlineComplete(specialDeadlinePrefix, formattedDate);
    // 强制更新预览
    updatePreview();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 启用公告开关 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable-announcement"
              checked={announcementData.isEnabled}
              onChange={handleCheckboxChange}
              className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="enable-announcement" className="ml-2 block text-base font-medium text-gray-800">
              启用公告
            </label>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={updatePreview}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 shadow-sm"
            >
              刷新预览
            </button>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 shadow-sm"
            >
              保存公告设置
            </button>
          </div>
        </div>
      </div>

      {/* 分为两栏布局：左侧编辑区域，右侧预览区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧编辑区域 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 公告标题和描述区块 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">公告标题和描述</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">公告标题</label>
                <input
                  type="text"
                  value={announcementData.title || ''}
                  onChange={(e) => handleChange(e, 'title')}
                  placeholder="例如: 📢 本周周五订餐公告"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">公告描述</label>
                <input
                  type="text"
                  value={announcementData.description || ''}
                  onChange={(e) => handleChange(e, 'description')}
                  placeholder="例如: 请查看以下重要信息，以便顺利完成订餐"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 订餐信息区块 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">订餐基本信息</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">订餐日期</label>
                  <div className="mt-1">
                    <input
                      type="date"
                      value={getCurrentDateForInput()}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">取餐时间</label>
                  <input
                    type="time"
                    value={formatTimeForInput(announcementData.pickupTime)}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                <label className="text-xs text-gray-500">取餐时间预览</label>
                <div className="mt-1 text-sm font-medium">{announcementData.orderDate}（{announcementData.orderWeekday}）{announcementData.pickupTime}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">取餐地点</label>
                <input
                  type="text"
                  value={announcementData.pickupLocation}
                  onChange={(e) => handleChange(e, 'pickupLocation')}
                  placeholder="例如: 蓝塔楼下"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">截单时间</label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">截单日期</label>
                      <input
                        type="date"
                        value={getCurrentDateForInput()}
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split('-').map(num => parseInt(num));
                          updateDeadlineDate(year, month, day);
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">截单时间</label>
                      <input
                        type="time"
                        value={extractTimeFromDeadline(announcementData.orderDeadline)}
                        onChange={(e) => handleDeadlineTimeChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                    <label className="text-xs text-gray-500">预览</label>
                    <div className="mt-1 text-sm font-medium">{announcementData.orderDeadline}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">特殊截单时间 (可选)</label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id="enable-special-deadline"
                      checked={!!announcementData.specialDeadline}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // 启用特殊截单时间，添加默认值
                          const orderDate = getCurrentDateForInput();
                          const [year, month, day] = orderDate.split('-').map(num => parseInt(num));
                          // 使用新的函数创建特殊截单时间
                          updateSpecialDeadlineDate(year, month, day);
                        } else {
                          // 禁用特殊截单时间
                          updateAnnouncementData(prev => ({
                            ...prev,
                            specialDeadline: undefined
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="enable-special-deadline" className="ml-2 text-xs text-gray-600">
                      启用特殊截单时间（例如：甜品提前一天截单）
                    </label>
                  </div>
                  
                  {announcementData.specialDeadline && (
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center mb-2">
                        <label className="text-xs text-gray-500 w-24">特殊说明：</label>
                        <input
                          type="text"
                          value={specialDeadlinePrefix}
                          onChange={(e) => {
                            // 更新特殊说明前缀
                            setSpecialDeadlinePrefix(e.target.value);
                            // 重新整合特殊截单时间
                            updateSpecialDeadlineComplete(e.target.value);
                            // 强制更新预览
                            updatePreview();
                          }}
                          placeholder="例如：甜品截至"
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">特殊截单日期</label>
                          <input
                            type="date"
                            value={(() => {
                              try {
                                if (announcementData.specialDeadline) {
                                  const dateMatch = announcementData.specialDeadline.match(/(\d+)\.(\d+)/);
                                  if (dateMatch) {
                                    const month = parseInt(dateMatch[1]);
                                    const day = parseInt(dateMatch[2]);
                                    const year = new Date().getFullYear();
                                    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                  }
                                }
                              } catch (error) {}
                              // 默认返回前一天
                              const yesterday = new Date();
                              yesterday.setDate(yesterday.getDate() - 1);
                              return yesterday.toISOString().split('T')[0];
                            })()}
                            onChange={handleSpecialDeadlineChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">特殊截单时间</label>
                          <input
                            type="time"
                            value={extractTimeFromSpecialDeadline(announcementData.specialDeadline)}
                            onChange={(e) => handleSpecialDeadlineTimeChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      
                      {/* 特殊截单时间预览 */}
                      <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                        <label className="text-xs text-gray-500">预览</label>
                        <div className="mt-1 text-sm font-medium text-orange-500">{previewData.specialDeadline || ''}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 活动提醒区块 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">活动提醒</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">活动提醒文本 (可选)</label>
              <textarea
                value={announcementData.promotionText || ''}
                onChange={(e) => handleChange(e, 'promotionText')}
                placeholder="例如: 本周特惠: 三份餐点八折优惠！单点饮料第二杯半价！"
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                设置活动提醒文本将在公告顶部显示一个醒目的黄色提示栏。如不需要，请留空。
              </p>
            </div>
          </div>

          {/* 支付方式设置区块 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">支付方式</h3>
            
            <div className="space-y-2">
              {announcementData.paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => {
                      const newMethods = [...announcementData.paymentMethods];
                      newMethods[index] = e.target.value;
                      updateAnnouncementData({
                        ...announcementData,
                        paymentMethods: newMethods
                      });
                    }}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  placeholder="添加新支付方式"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="ml-2 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 温馨提示设置区块 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">温馨提示</h3>
            
            <div className="space-y-2">
              {announcementData.tips.map((tip, index) => (
                <div key={index} className="flex items-center">
                  <textarea
                    value={tip}
                    onChange={(e) => {
                      const newTips = [...announcementData.tips];
                      newTips[index] = e.target.value;
                      updateAnnouncementData({
                        ...announcementData,
                        tips: newTips
                      });
                    }}
                    rows={2}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTip(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center mt-2">
                <textarea
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="添加新提示"
                  rows={2}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={addTip}
                  className="ml-2 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-medium text-gray-800">公告预览</h3>
              <button
                type="button"
                onClick={updatePreview}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                刷新预览
              </button>
            </div>
            
            {/* 弹窗样式预览 */}
            <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 bg-white">
              {/* 弹窗头部 */}
              <div className="p-4 pb-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
                <h3 className="text-xl font-bold text-white">{previewData.title || `📢 本周${previewData.orderWeekday}订餐公告`}</h3>
                <p className="text-blue-100 text-sm">
                  {previewData.description || '请查看以下重要信息，以便顺利完成订餐'}
                </p>
              </div>
              
              {/* 弹窗内容 */}
              <div className="p-4 pt-3">
                {/* 活动提醒预览 */}
                {previewData.promotionText && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 rounded-r-md">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1.5 flex-shrink-0" />
                      <span className="font-medium text-yellow-800 text-sm">{previewData.promotionText}</span>
                    </div>
                  </div>
                )}
                
                {/* 基本信息卡片 */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-1.5 text-sm">基本信息</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <span className="w-20 text-xs text-gray-600 mt-0.5">取餐时间：</span>
                      <span className="font-medium text-gray-900 text-sm">{previewData.orderDate}（{previewData.orderWeekday}）{previewData.pickupTime}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-20 text-xs text-gray-600 mt-0.5">截单时间：</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">{previewData.orderDeadline}</span>
                        {previewData.specialDeadline && (
                          <span className="text-orange-500 font-medium text-xs">{previewData.specialDeadline}</span>
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-20 text-xs text-gray-600 mt-0.5">取餐地点：</span>
                      <span className="font-medium text-gray-900 text-sm">{previewData.pickupLocation}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-20 text-xs text-gray-600 mt-0.5">支付方式：</span>
                      <span className="font-medium text-gray-900 text-sm">{previewData.paymentMethods.join(' / ')}</span>
                    </li>
                  </ul>
                </div>
                
                {/* 温馨提示 */}
                {previewData.tips.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <h4 className="font-semibold text-amber-700 mb-1 text-sm">温馨提示</h4>
                    <ul className="space-y-0.5">
                      {previewData.tips.map((tip, index) => (
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
                
                {/* 操作按钮预览 */}
                <div className="mt-3 flex justify-center">
                  <button type="button" className="w-full px-4 py-2.5 bg-orange-500 text-white font-medium rounded-md text-sm shadow-sm hover:bg-orange-600 transition-colors cursor-default">
                    去点餐
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">↑ 弹窗预览效果 ↑</p>
          </div>
        </div>
      </div>

      {/* 添加一个隐藏的调试信息，显示更新计数器 */}
      <div className="hidden">预览更新次数: {updateCounter}</div>
    </form>
  );
};

export default AnnouncementEditor; 