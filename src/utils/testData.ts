import { Order } from '../contexts/OrderContext';

// 生成今天的取餐码格式
const generateTodayPickupCode = (sequence: number): string => {
  const today = new Date();
  const dateString = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');
  return `${dateString}${sequence.toString().padStart(3, '0')}`;
};

export const sampleOrders: Partial<Order>[] = [
  {
    id: 'test-order-1',
    pickupCode: generateTodayPickupCode(1),
    groupName: '小明',
    notes: '不要香菜，多加辣椒',
    status: 'pending',
    total: 25.5,
    subtotal: 28.0,
    discount: 2.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: []
  },
  {
    id: 'test-order-2',
    pickupCode: generateTodayPickupCode(2),
    groupName: '美食爱好者',
    notes: '请打包，谢谢',
    status: 'preparing',
    total: 45.0,
    subtotal: 45.0,
    discount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: []
  },
  {
    id: 'test-order-3',
    pickupCode: generateTodayPickupCode(3),
    groupName: '办公室小伙伴',
    status: 'ready',
    total: 89.5,
    subtotal: 95.0,
    discount: 5.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: []
  }
];

// 将示例订单添加到localStorage（仅用于测试）
export const loadSampleOrdersToStorage = () => {
  try {
    const existingOrders = localStorage.getItem('orders');
    if (!existingOrders) {
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
      console.log('已加载示例订单数据');
    }
  } catch (error) {
    console.error('加载示例订单失败:', error);
  }
}; 