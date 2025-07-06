import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../../../contexts/MenuContext';
import { useCart } from '../../../contexts/CartContext';

interface MenuItemOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

// 定义选项类型
interface OptionGroup {
  title: string;
  type: 'radio' | 'checkbox';
  required?: boolean;
  options: {
    id: string;
    name: string;
    price?: number;
    isDefault?: boolean;
  }[];
}

const MenuItemOptionModal: React.FC<MenuItemOptionModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const { addItem } = useCart();
  
  // 获取初始规格大小
  const getInitialSize = () => {
    if (item.customOptions && item.customOptions.length > 0) {
      // 查找份量/杯型/数量相关选项
      const sizeOption = item.customOptions.find(group => 
        group.title === '份量' || group.title === '杯型' || group.title === '数量'
      );
      if (sizeOption && sizeOption.options.length > 0) {
        const defaultOption = sizeOption.options.find(opt => opt.isDefault);
        return defaultOption ? defaultOption.name : sizeOption.options[0].name;
      }
    }
    return ''; // 返回空字符串而不是"标准"
  };
  
  // 状态管理：扩展为动态生成的选项状态
  const [selectedSize, setSelectedSize] = useState(getInitialSize());
  const [selectedOptions, setSelectedOptions] = useState<{[groupTitle: string]: string | string[]}>({});
  const [quantity, setQuantity] = useState(1); // 添加数量状态
  
  // 初始化默认选项
  useEffect(() => {
    const defaultOptions: {[groupTitle: string]: string | string[]} = {};
    
    // 如果有自定义选项，添加默认值
    if (item.customOptions) {
      item.customOptions.forEach(group => {
        const defaultOption = group.options.find(opt => opt.isDefault);
        if (defaultOption) {
          if (group.type === 'checkbox') {
            defaultOptions[group.title] = [(defaultOption.id)];
          } else {
            defaultOptions[group.title] = defaultOption.id;
          }
          
          // 同时更新selectedSize状态
          if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
            setSelectedSize(defaultOption.name);
          }
        } else if (group.options.length > 0) {
          // 如果没有默认选项，则选择第一个
          if (group.type === 'checkbox') {
            defaultOptions[group.title] = [];
          } else {
            defaultOptions[group.title] = group.options[0].id;
            
            // 同时更新selectedSize状态
            if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
              setSelectedSize(group.options[0].name);
            }
          }
        }
      });
    }
    
    // 移除了旧版饮品选项的兼容代码，统一使用自定义选项
    
    setSelectedOptions(defaultOptions);
    setQuantity(1); // 重置数量为1
  }, [item]);
  
  // 获取当前选择的价格
  const getCurrentPrice = (): number => {
    let totalPrice = item.price; // 从基础价格开始
    
    // 计算自定义选项的价格
    if (item.customOptions) {
      item.customOptions.forEach(group => {
        const selectedId = selectedOptions[group.title];
        
        if (group.type === 'checkbox' && Array.isArray(selectedId)) {
          // 对于复选框选项，累加所有选中项的价格
          selectedId.forEach(id => {
            const option = group.options.find(opt => opt.id === id);
            if (option && option.price !== undefined) {
              totalPrice += option.price;
            }
          });
        } else if (typeof selectedId === 'string') {
          // 对于单选选项
          const selectedOption = group.options.find(opt => opt.id === selectedId);
          
          if (selectedOption && selectedOption.price !== undefined) {
            // 检查是否是替换价格模式（完全替换基础价格）还是附加费模式
            if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
              // 检查选项组中是否有选项没有价格（说明是基础价格+附加费模式）
              const hasOptionWithoutPrice = group.options.some(opt => opt.price === undefined);
              
              if (hasOptionWithoutPrice) {
                // 基础价格+附加费模式：只添加额外费用
                totalPrice += selectedOption.price;
              } else {
                // 完全替换价格模式：用选项价格替换基础价格
                totalPrice = selectedOption.price;
              }
            } else {
              // 其他类型的选项都是附加费
              totalPrice += selectedOption.price;
            }
          }
        }
      });
    }
    
    return totalPrice * quantity;
  };
  
  // 验证必选项是否已选择
  const validateRequiredOptions = (): { isValid: boolean; missingOptions: string[] } => {
    const missingOptions: string[] = [];
    
    if (item.customOptions) {
      item.customOptions.forEach(group => {
        if (group.required) {
          const selectedValue = selectedOptions[group.title];
          
          if (group.type === 'checkbox') {
            // 对于复选框，检查是否至少选择了一个
            if (!Array.isArray(selectedValue) || selectedValue.length === 0) {
              missingOptions.push(group.title);
            }
          } else {
            // 对于单选，检查是否已选择
            if (!selectedValue) {
              missingOptions.push(group.title);
            }
          }
        }
      });
    }
    
    return {
      isValid: missingOptions.length === 0,
      missingOptions
    };
  };

  // 处理添加到购物车
  const handleAddToCart = () => {
    // 验证必选项
    const validation = validateRequiredOptions();
    
    if (!validation.isValid) {
      // 显示错误提示
      alert(`请选择必选项：${validation.missingOptions.join('、')}`);
      return;
    }
    
    // 整合所有选项为特殊说明
    const specialInstructions = formatSelectedOptions();
    
    // 计算单价（不包括数量）
    const unitPrice = getCurrentPrice() / quantity;
    
    // 添加到购物车，传递预计算的单价
    addItem(item, quantity, selectedSize, specialInstructions, unitPrice);
    
    // 关闭弹窗
    onClose();
  };

  // 数量控制函数
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  // 格式化选中的选项为文本
  const formatSelectedOptions = (): string => {
    const options: string[] = [];
    
    // 添加自定义选项文本
    if (item.customOptions) {
      item.customOptions.forEach(group => {
        const selectedIds = selectedOptions[group.title];
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          // 处理多选
          const selectedNames = selectedIds.map(id => 
            group.options.find(opt => opt.id === id)?.name || id
          );
          options.push(`${group.title}: ${selectedNames.join('、')}`);
        } else if (typeof selectedIds === 'string') {
          // 处理单选
          const selectedName = group.options.find(opt => opt.id === selectedIds)?.name || selectedIds;
          options.push(`${group.title}: ${selectedName}`);
        }
      });
    }
    
    return options.join('、'); // 只返回实际的选项，不包含"标准"
  };
  
  if (!isOpen) return null;
  
  // 生成自定义选项
  const generateOptions = (): OptionGroup[] => {
    const options: OptionGroup[] = [];
    
    // 使用统一的自定义选项系统
    if (item.customOptions && item.customOptions.length > 0) {
      item.customOptions.forEach(group => {
        options.push({
          title: group.title,
          type: group.type === 'checkbox' ? 'checkbox' : 'radio',
          required: group.required,
          options: group.options
        });
      });
    }
    
    return options;
  };
  
  // 处理选项变更
  const handleOptionChange = (groupTitle: string, groupType: string, optionId: string, checked?: boolean) => {
    // 处理份量、杯型、数量等特殊组的size设置
    if (groupTitle === '份量' || groupTitle === '杯型' || groupTitle === '数量') {
      if (item.customOptions) {
        const sizeGroup = item.customOptions.find(group => group.title === groupTitle);
        if (sizeGroup) {
          const selectedOption = sizeGroup.options.find(opt => opt.id === optionId);
          if (selectedOption) {
            setSelectedSize(selectedOption.name);
          }
        }
      }
    }
    
    if (groupType === 'checkbox') {
      setSelectedOptions(prev => {
        const currentSelected = Array.isArray(prev[groupTitle]) ? [...prev[groupTitle] as string[]] : [];
        
        if (checked) {
          // 添加选项
          if (!currentSelected.includes(optionId)) {
            return { ...prev, [groupTitle]: [...currentSelected, optionId] };
          }
        } else {
          // 移除选项
          return { ...prev, [groupTitle]: currentSelected.filter(id => id !== optionId) };
        }
        
        return prev;
      });
    } else {
      // 单选
      setSelectedOptions(prev => ({
        ...prev,
        [groupTitle]: optionId
      }));
    }
  };
  
  // 根据选项组类型渲染单个选项
  const renderOption = (group: OptionGroup, option: any) => {
    let isSelected = false;
    
    if (group.title === '份量' || group.title === '杯型' || group.title === '数量') {
      isSelected = option.name === selectedSize;
    } else if (group.type === 'checkbox') {
      const selectedIds = selectedOptions[group.title] || [];
      isSelected = Array.isArray(selectedIds) && selectedIds.includes(option.id);
    } else {
      isSelected = selectedOptions[group.title] === option.id;
    }
    
    if (group.type === 'checkbox') {
      return (
        <label
          key={option.id}
          className={`flex items-center space-x-2 rounded-full border px-4 py-2 text-sm transition-colors ${
            isSelected
              ? 'border-orange-500 bg-orange-50 text-orange-500'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleOptionChange(group.title, group.type, option.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span>{option.name} {option.price ? `+€${option.price.toFixed(1)}` : ''}</span>
        </label>
      );
    }
    
    return (
      <button
        key={option.id}
        onClick={() => handleOptionChange(group.title, group.type, option.id)}
        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
          isSelected
            ? 'border-orange-500 bg-orange-50 text-orange-500'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
        }`}
      >
        {option.name}
        {option.price !== undefined && (
          (group.title === '份量' || group.title === '杯型' || group.title === '数量') ? 
            (group.options.some(opt => opt.price === undefined) ? 
              ` +€${option.price.toFixed(1)}` : 
              ` €${option.price.toFixed(1)}`
            ) : 
            ` +€${option.price.toFixed(1)}`
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 sm:items-center">
      <div className="relative w-full max-h-[85vh] overflow-auto rounded-t-xl bg-white sm:max-w-md sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-4">
          <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {generateOptions().map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-gray-800">
                {group.title}
                {group.required && <span className="ml-1 text-sm text-red-500">*</span>}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {group.options.map(option => renderOption(group, option))}
              </div>
            </div>
          ))}

          {/* 数量选择器 */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium text-gray-800">数量</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={decrementQuantity}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xl font-medium text-gray-800 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-100 bg-white p-4">
          <div>
            <span className="text-2xl font-bold text-orange-500">€{getCurrentPrice().toFixed(1)}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="rounded-full bg-orange-500 px-6 py-2 text-white shadow-md hover:bg-orange-600"
          >
            加入购物车
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemOptionModal; 