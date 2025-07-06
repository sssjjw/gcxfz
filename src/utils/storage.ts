// 从localStorage加载数据
export const loadDataFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`加载${key}数据失败:`, error);
    return defaultValue;
  }
};

// 保存数据到localStorage
export const saveDataToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    
    // 发送自定义事件通知其他组件
    const updateEvent = new CustomEvent(`${key}Update`, { detail: data });
    window.dispatchEvent(updateEvent);
  } catch (error) {
    console.error(`保存${key}数据失败:`, error);
  }
}; 