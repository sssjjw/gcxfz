import React, { useState } from 'react';
import { Edit, Plus, Trash, Grid, Tag } from 'lucide-react';
import { MenuItem, useMenu } from '../../../contexts/MenuContext';
import MenuItemForm from '../components/MenuItemForm';
import CategoryManagement from '../components/CategoryManagement';

const MenuManagement: React.FC = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [activeTab, setActiveTab] = useState<'menu' | 'category'>('menu');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 过滤菜品
  const filteredItems = menuItems.filter(item => {
    // 按分类过滤
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    
    // 按搜索词过滤
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 处理添加或编辑菜品
  const handleSaveItem = (item: MenuItem) => {
    if (item.id && menuItems.some(i => i.id === item.id)) {
      // 更新现有菜品
      updateMenuItem(item.id, item);
    } else {
      // 添加新菜品
      addMenuItem(item);
    }
    
    // 关闭表单
    setShowForm(false);
    setEditingItem(undefined);
  };
  
  // 打开编辑表单
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };
  
  // 打开添加新菜品表单
  const handleAddNewItem = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };
  
  // 取消表单
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };
  
  // 渲染菜品列表
  const renderItemList = () => {
    if (filteredItems.length === 0) {
      return (
        <div className="py-12 text-center text-gray-500">
          {searchQuery ? '没有找到匹配的菜品' : '此分类暂无菜品'}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow">
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.available ? '已上架' : '已下架'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-1 flex justify-between">
                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                <div className="text-orange-500 font-semibold">
                  €{item.price}
                  {item.customOptions && item.customOptions.length > 0 && <span className="text-xs">起</span>}
                </div>
              </div>
              
              <p className="mb-3 text-sm text-gray-500 line-clamp-2">{item.description}</p>
              
              {/* 自定义选项信息 */}
              {item.customOptions && item.customOptions.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-gray-500">自定义选项：</span>
                  <div className="mt-1">
                    {item.customOptions.map((group, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="text-xs font-medium text-gray-600">{group.title}：</span>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {group.options.map((option, optIdx) => (
                            <span 
                              key={optIdx}
                              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                            >
                              {option.name}
                              {option.price ? ` +€${option.price.toFixed(1)}` : ''}
                              {option.isDefault && ' (默认)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {categories.find(c => c.id === item.category)?.name || '未分类'}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="rounded-md bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm(`确定要删除"${item.name}"吗？`)) {
                        deleteMenuItem(item.id);
                      }
                    }}
                    className="rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">菜单管理</h1>
      </div>

      {/* 选项卡导航 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Grid className="h-4 w-4" />
              <span>菜品管理</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('category')}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'category'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>分类管理</span>
            </div>
          </button>
        </nav>
      </div>
      
      {/* 菜品管理内容 */}
      {activeTab === 'menu' && (
        <>
          {/* 添加菜品按钮 */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleAddNewItem}
              className="flex items-center space-x-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              <span>添加菜品</span>
            </button>
          </div>

          {/* 筛选和搜索栏 */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-4 py-1.5 text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部菜品
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索菜品..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          
          {/* 表单或列表 */}
          {showForm ? (
            <MenuItemForm
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={handleCancelForm}
            />
          ) : (
            renderItemList()
          )}
        </>
      )}

      {/* 分类管理内容 */}
      {activeTab === 'category' && (
        <CategoryManagement />
      )}
    </div>
  );
};

export default MenuManagement;