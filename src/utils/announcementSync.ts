/**
 * 公告数据同步工具
 * 
 * 用于确保前端显示最新的公告数据，不受缓存影响
 */

import { AnnouncementData } from '../pages/customer/components/Announcement';

// 版本标识，用于跟踪数据更新
export const ANNOUNCEMENT_VERSION = '3.0.0';

// 从localStorage获取公告数据的函数
export const getAnnouncementData = <T,>(defaultData: T): T => {
  try {
    // 尝试从localStorage获取数据
    const data = localStorage.getItem('announcementData');
    if (data) {
      console.log('从本地存储获取公告数据:', data);
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('解析公告数据失败:', error);
  }
  
  // 如果出错或没有数据，返回默认值
  return defaultData;
};

// 强制同步公告数据的函数
export const forceAnnouncementSync = (callback: (data: AnnouncementData) => void, defaultData: AnnouncementData) => {
  // 清除阻止弹窗显示的标记
  localStorage.removeItem('hasShownAnnouncementModal');
  
  // 获取最新数据
  const latestData = getAnnouncementData(defaultData);
  
  // 调用回调函数传递数据
  callback(latestData);
  
  // 添加监听器，侦听公告更新事件
  const handleAnnouncementUpdate = (e: CustomEvent<AnnouncementData>) => {
    console.log('收到公告更新事件:', e.detail);
    if (e.detail) {
      callback(e.detail);
    }
  };
  
  // 绑定事件监听
  window.addEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
  document.addEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
    document.removeEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
  };
};

// 模拟后台API获取最新公告数据
export const fetchLatestAnnouncement = (): Promise<AnnouncementData> => {
  return new Promise((resolve) => {
    // 从localStorage获取最新数据
    const data = localStorage.getItem('announcementData');
    if (data) {
      resolve(JSON.parse(data));
    } else {
      // 如果没有数据，触发一个错误
      throw new Error('未找到公告数据');
    }
  });
}; 