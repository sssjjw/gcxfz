/**
 * 强制刷新浏览器缓存的工具
 * 
 * 实现功能：检查版本号，如果版本号不匹配，自动刷新并清除缓存
 */

// 当前应用版本号 - 增加版本号以确保刷新
const APP_VERSION = '1.3.0';
const VERSION_KEY = 'app_version';

// 检查版本并在需要时强制刷新
export const checkVersion = () => {
  // 判断是否刚刚通过时间戳参数刷新过
  if (window.location.search.includes('t=')) {
    console.log('页面已通过时间戳参数刷新，不再继续刷新');
    // 更新版本
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    return true;
  }
  
  const savedVersion = localStorage.getItem(VERSION_KEY);
  
  // 如果版本不同，进行刷新
  if (savedVersion !== APP_VERSION) {
    console.log(`版本不匹配: 当前=${APP_VERSION}, 保存=${savedVersion}`);
    
    // 先清除可能影响的存储
    try {
      // 清除可能导致弹窗不更新的存储项
      localStorage.removeItem('announcementData');
      localStorage.removeItem('hasShownAnnouncementModal');
      
      // 更新版本
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      
      // 清除所有的服务工作线程
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // 使用更彻底的方式刷新页面 - 添加强制重载参数和禁用缓存
      const reloadURL = window.location.href.split('?')[0] + 
                       '?t=' + new Date().getTime() + 
                       '&forcereload=true';
      
      window.location.href = reloadURL;
    } catch (error) {
      console.error('刷新出错:', error);
    }
    
    return false;
  }
  
  return true;
};

// 导出默认函数以方便导入
export default function setupForceRefresh() {
  // 只进行版本检查，不再添加刷新按钮
  return checkVersion();
} 