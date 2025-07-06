import React, { useState, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';
import { MenuItem, useMenu } from '../../../contexts/MenuContext';

interface MenuItemFormProps {
  item?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

const DEFAULT_ITEM: MenuItem = {
  id: '',
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: '',
  available: true
};

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, onSave, onCancel }) => {
  const { categories } = useMenu();
  const [formData, setFormData] = useState<MenuItem>(item || {...DEFAULT_ITEM});
  const [customOptionGroups, setCustomOptionGroups] = useState<MenuItem['customOptions']>([]);

  // 当编辑的菜品改变时，更新表单数据
  useEffect(() => {
    if (item) {
      setFormData(item);
      
      // 如果有自定义选项，初始化自定义选项数据
      if (item.customOptions && item.customOptions.length > 0) {
        setCustomOptionGroups(item.customOptions);
      } else {
        setCustomOptionGroups([]);
      }
    } else {
      setFormData({...DEFAULT_ITEM});
      setCustomOptionGroups([]);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? 0 : parseFloat(value) || 0) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // 新增：添加自定义选项组
  const addCustomOptionGroup = () => {
    setCustomOptionGroups(prev => [
      ...prev || [],
      {
        type: `option_${Date.now()}`,
        title: "",
        required: false,
        options: [{
          id: `option_${Date.now()}`,
          name: "",
          isDefault: true
        }]
      }
    ]);
  };

  // 新增：删除自定义选项组
  const removeCustomOptionGroup = (index: number) => {
    setCustomOptionGroups(prev => {
      const updated = [...(prev || [])];
      updated.splice(index, 1);
      return updated;
    });
  };

  // 新增：更新自定义选项组属性
  const updateCustomOptionGroup = (index: number, field: string, value: any) => {
    setCustomOptionGroups(prev => {
      const updated = [...(prev || [])];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // 新增：添加选项到自定义选项组
  const addOptionToGroup = (groupIndex: number) => {
    setCustomOptionGroups(prev => {
      const updated = [...(prev || [])];
      updated[groupIndex] = {
        ...updated[groupIndex],
        options: [
          ...(updated[groupIndex].options || []),
          {
            id: `option_${Date.now()}`,
            name: "",
            isDefault: false
          }
        ]
      };
      return updated;
    });
  };

  // 新增：删除自定义选项
  const removeOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    setCustomOptionGroups(prev => {
      const updated = [...(prev || [])];
      const options = [...updated[groupIndex].options];
      options.splice(optionIndex, 1);
      updated[groupIndex] = {
        ...updated[groupIndex],
        options
      };
      return updated;
    });
  };

  // 新增：更新自定义选项的属性
  const updateOption = (groupIndex: number, optionIndex: number, field: string, value: any) => {
    setCustomOptionGroups(prev => {
      const updated = [...(prev || [])];
      const options = [...updated[groupIndex].options];
      options[optionIndex] = {
        ...options[optionIndex],
        [field]: field === 'price' ? (value === '' ? undefined : parseFloat(value) || 0) : value
      };
      updated[groupIndex] = {
        ...updated[groupIndex],
        options
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 生成ID（如果是新项目）
    const itemToSave: MenuItem = {
      ...formData,
      id: formData.id || `item_${Date.now()}`,
      customOptions: customOptionGroups || []
    };
    
    onSave(itemToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {item ? '编辑菜品' : '添加新菜品'}
      </h2>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 基本信息 */}
        <div className="space-y-4 md:col-span-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              菜品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            ></textarea>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            价格 (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price !== undefined ? formData.price : ''}
            onChange={handleInputChange}
            step="0.1"
            min="0"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类 <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">选择分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            图片URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label className="text-sm font-medium text-gray-700">可供应</label>
          </div>
        </div>
        
        {/* 自定义选项 */}
        <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-800">自定义选项</h3>
            
            <button
              type="button"
              onClick={addCustomOptionGroup}
              className="flex items-center space-x-1 rounded-md bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>添加选项组</span>
            </button>
          </div>
          
          {customOptionGroups && customOptionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 flex items-center space-x-3">
                  <input
                    type="text"
                    value={group.title}
                    onChange={(e) => updateCustomOptionGroup(groupIndex, 'title', e.target.value)}
                    placeholder="选项组名称（如温度、辣度等）"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  
                  <select
                    value={group.type === 'checkbox' ? 'checkbox' : 'radio'}
                    onChange={(e) => updateCustomOptionGroup(groupIndex, 'type', e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="radio">单选</option>
                    <option value="checkbox">多选</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeCustomOptionGroup(groupIndex)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={!!group.required}
                  onChange={(e) => updateCustomOptionGroup(groupIndex, 'required', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">必选</label>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">选项列表</h4>
                  <button
                    type="button"
                    onClick={() => addOptionToGroup(groupIndex)}
                    className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  >
                    <Plus className="h-3 w-3" />
                    <span>添加选项</span>
                  </button>
                </div>
                
                {group.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(groupIndex, optionIndex, 'name', e.target.value)}
                        placeholder="选项名称"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="w-24">
                      <input
                        type="number"
                        value={option.price !== undefined ? option.price : ''}
                        onChange={(e) => updateOption(groupIndex, optionIndex, 'price', e.target.value)}
                        step="0.1"
                        min="0"
                        placeholder="额外费用"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!option.isDefault}
                        onChange={(e) => updateOption(groupIndex, optionIndex, 'isDefault', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <label className="text-xs text-gray-500">默认</label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeOptionFromGroup(groupIndex, optionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* 提示信息 */}
          {(!customOptionGroups || customOptionGroups.length === 0) && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">暂无自定义选项</p>
              <p className="text-xs">点击"添加选项组"为菜品添加个性化选项（如辣度、温度、加料等）</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 提交按钮 */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          取消
        </button>
        
        <button
          type="submit"
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
        >
          {item ? '更新' : '添加'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm; 