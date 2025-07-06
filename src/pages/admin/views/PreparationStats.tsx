import React, { useMemo } from 'react';
import { ChefHat, Package, TrendingUp, Clock, BarChart } from 'lucide-react';
import { useOrder } from '../../../contexts/OrderContext';

interface DishStats {
  name: string;
  totalQuantity: number;
  options: Map<string, number>;
  baseItemName: string;
  variant: string;
  special: string;
}

interface PreparationStatsProps {}

const PreparationStats: React.FC<PreparationStatsProps> = () => {
  const { orders } = useOrder();

  // 提取和合并选项的函数
  const extractAndMergeOptions = (special: string): string[] => {
    if (!special) return [];
    
    const extractedOptions: string[] = [];
    
    // 按逗号分割选项
    const options = special.split('、').map(opt => opt.trim());
    
    options.forEach(option => {
      // 提取关键词，比如从"选择日期: 周一、周二"中提取"周一"、"周二"
      if (option.includes('选择日期:')) {
        const datesPart = option.split('选择日期:')[1]?.trim();
        if (datesPart) {
          // 进一步分割日期选项
          const dates = datesPart.split('、').map(d => d.trim());
          dates.forEach(date => {
            if (date) {
              extractedOptions.push(`选择日期: ${date}`);
            }
          });
        }
      } else if (option.includes(':')) {
        // 对于其他包含冒号的选项，直接添加
        extractedOptions.push(option);
      } else {
        // 其他选项直接添加
        extractedOptions.push(option);
      }
    });
    
    return extractedOptions;
  };

  // Calculate dish preparation statistics for incomplete orders
  const calculateStats = useMemo(() => {
    const stats = new Map<string, DishStats>();

    // 只筛选未完成的订单
    const incompleteOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
    );

    incompleteOrders.forEach(order => {
      order.items.forEach(item => {
        // 构建包含规格信息的唯一标识
        let itemKey = item.menuItem.name;
        let displayName = item.menuItem.name;
        
        // 添加规格信息到显示名称
        if (item.variant && item.variant.trim() !== '') {
          displayName += ` (${item.variant})`;
          itemKey += `_${item.variant}`;
        }
        
        if (item.special && item.special.trim() !== '') {
          displayName += ` - ${item.special}`;
          itemKey += `_${item.special}`;
        }
        
        if (!stats.has(itemKey)) {
          stats.set(itemKey, {
            name: displayName,
            totalQuantity: 0,
            options: new Map<string, number>(),
            baseItemName: item.menuItem.name,
            variant: item.variant || '',
            special: item.special || ''
          });
        }

        const current = stats.get(itemKey)!;
        current.totalQuantity += item.quantity;

        // 处理特殊选项，进行合并同类项
        if (item.special) {
          const extractedOptions = extractAndMergeOptions(item.special);
          extractedOptions.forEach(option => {
            const optionCount = current.options.get(option) || 0;
            current.options.set(option, optionCount + item.quantity);
          });
        }
      });
    });

    return Array.from(stats.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [orders]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">备餐统计</h1>
        <p className="mt-1 text-sm text-gray-600">统计未完成订单的菜品需求，优化备餐计划</p>
      </div>

      {/* 概览卡片 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">菜品种类</p>
              <p className="text-2xl font-semibold text-gray-900">{calculateStats.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总菜品数</p>
              <p className="text-2xl font-semibold text-gray-900">{calculateStats.reduce((sum, item) => sum + item.totalQuantity, 0)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">待处理订单</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.filter(order => order.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">制作中订单</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.filter(order => order.status === 'preparing').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 菜品分类统计 */}
      <div className="space-y-6">
        {calculateStats.map((item) => (
          <div key={item.name} className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {item.baseItemName}
                </h2>
                {(item.variant || item.special) && (
                  <div className="mt-1 space-y-1">
                    {item.variant && item.variant.trim() !== '' && (
                      <p className="text-sm text-blue-600">规格: {item.variant}</p>
                    )}
                    {item.special && item.special.trim() !== '' && (
                      <p className="text-sm text-green-600">选项: {item.special}</p>
                    )}
                  </div>
                )}
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                总计 {item.totalQuantity} 份
              </span>
            </div>

            {item.options.size > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        详细规格选择
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        数量
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.from(item.options.entries())
                      .sort(([,a], [,b]) => b - a)
                      .map(([option, quantity]) => (
                      <tr key={option}>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {option}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {quantity} 份
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {item.options.size === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">此菜品无特殊规格要求</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {calculateStats.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border">
          <BarChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">暂无未完成订单</h3>
          <p className="mt-2 text-sm text-gray-500">
            当前没有需要备餐的订单
          </p>
        </div>
      )}
    </div>
  );
};

export default PreparationStats; 