// 用于开发测试和调试目的，重置公告弹窗的显示状态
export const resetAnnouncementModalState = () => {
  try {
    localStorage.removeItem('hasShownAnnouncementModal');
    console.log('重置公告弹窗状态成功，下次刷新页面将再次显示弹窗');
    return true;
  } catch (error) {
    console.error('重置公告弹窗状态失败:', error);
    return false;
  }
}; 