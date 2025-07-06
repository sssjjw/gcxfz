import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Sparkles, Bell, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import Announcement, { defaultAnnouncementData, AnnouncementData } from './Announcement';
import { loadDataFromStorage } from '../../../utils/storage';

// 餐厅信息接口
interface RestaurantInfo {
  name: string;
  logo: string;
}

// 默认餐厅信息 - 修改为哥村小饭桌
const defaultRestaurantInfo: RestaurantInfo = {
  name: '哥村小饭桌',
  logo: 'https://images.pexels.com/photos/6287525/pexels-photo-6287525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
};

interface RestaurantHeaderProps {
  hideAnnouncement?: boolean;
  onAnnouncementClick?: () => void;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ 
  hideAnnouncement = false, 
  onAnnouncementClick 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // 从localStorage获取公告数据和餐厅信息
  const [announcementData, setAnnouncementData] = useState<AnnouncementData>(() => 
    loadDataFromStorage('announcementData', defaultAnnouncementData)
  );
  
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => 
    loadDataFromStorage('restaurantInfo', defaultRestaurantInfo)
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 监听localStorage中数据的变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'announcementData' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setAnnouncementData(newData);
        } catch (error) {
          console.error('Error parsing announcement data:', error);
        }
      }
      
      if (e.key === 'restaurantInfo' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setRestaurantInfo(newData);
        } catch (error) {
          console.error('Error parsing restaurant info:', error);
        }
      }
    };

    // 监听自定义事件，用于同一页面内的更新
    const handleAnnouncementUpdate = (e: CustomEvent<AnnouncementData>) => {
      setAnnouncementData(e.detail);
    };
    
    const handleRestaurantInfoUpdate = (e: CustomEvent<RestaurantInfo>) => {
      setRestaurantInfo(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
    window.addEventListener('restaurantInfoUpdate', handleRestaurantInfoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
      window.removeEventListener('restaurantInfoUpdate', handleRestaurantInfoUpdate as EventListener);
    };
  }, []);

  // 设置标题栏高度为CSS变量
  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, [showAnnouncement, isScrolled]);

  // 处理公告按钮点击
  const handleAnnouncementButtonClick = () => {
    if (onAnnouncementClick) {
      onAnnouncementClick();
    } else {
      setShowAnnouncement(!showAnnouncement);
    }
  };

  // 处理管理员入口点击
  const handleAdminClick = () => {
    // 使用URL参数的方式显示管理员登录
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('admin', 'login');
    const newUrl = currentUrl.toString();
    console.log('🔧 管理员按钮点击:', {
      from: window.location.href,
      to: newUrl
    });
    window.location.href = newUrl;
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-30 w-full">
      {/* Main Header */}
      <div 
        className={`relative overflow-hidden transition-all duration-500 ${
          isScrolled 
            ? 'py-3' 
            : 'py-4'
        }`}
      >
        {/* 背景渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-opacity duration-300 ${
          isScrolled ? 'opacity-95' : 'opacity-90'
        }`}></div>
        
        {/* 装饰图案 - 上方波浪 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-20"></div>
        
        {/* 装饰图案 - 光效 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-orange-600 rounded-full blur-3xl opacity-10"></div>
        
        {/* 主要内容 - 修改为左右布局 */}
        <div className="relative flex items-center justify-between px-4">
          {/* 左侧：图标和餐厅名称 */}
          <div className="flex items-center">
            {/* Logo背景光环 */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md transform scale-110"></div>
              <div className={`relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-lg transform hover:scale-110 transition-all duration-300 ${
                isScrolled ? '' : 'ring-4 ring-white/30'
              }`}>
                <img
                  src={restaurantInfo.logo}
                  alt={restaurantInfo.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* 标题文字组 */}
            <div className="ml-3 flex items-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {restaurantInfo.name}
              </h1>
              
              {/* 装饰性图标 */}
              <ChefHat className="ml-2 h-5 w-5 text-yellow-200 drop-shadow-md" />
              <Sparkles className="ml-1 h-4 w-4 text-yellow-100 animate-pulse" />
            </div>
          </div>

          {/* 右侧：公告按钮和管理员入口 */}
          <div className="flex items-center space-x-3">
            {/* 管理员入口按钮 */}
            <button
              onClick={handleAdminClick}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 transition-all duration-300 border border-white/20"
            >
              <Settings className="h-4 w-4 text-white" />
              <span className="text-white font-medium text-xs hidden sm:block">管理</span>
            </button>

            {/* 公告按钮 */}
            {!hideAnnouncement && announcementData.isEnabled && (
              <button
                onClick={handleAnnouncementButtonClick}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-300 border border-white/20"
              >
                <Bell className="h-5 w-5 text-white" />
                <span className="text-white font-medium text-sm">公告</span>
                {showAnnouncement ? (
                  <ChevronUp className="h-4 w-4 text-white" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* 底部装饰线 */}
        <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transition-opacity duration-300 ${
          isScrolled ? 'opacity-40' : 'opacity-20'
        }`}></div>
      </div>
      
      {/* 公告栏区域 - 根据showAnnouncement状态决定是否显示 */}
      {!hideAnnouncement && showAnnouncement && announcementData.isEnabled && (
        <div className="w-full bg-white px-4 pt-1 pb-0 shadow-sm">
          <Announcement 
            data={announcementData} 
            onClose={() => setShowAnnouncement(false)} 
          />
        </div>
      )}
    </header>
  );
};

export default RestaurantHeader;