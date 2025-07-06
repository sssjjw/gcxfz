import React, { useState } from 'react';
import { Edit, Plus, Trash, MoveUp, MoveDown } from 'lucide-react';
import { Category, useMenu } from '../../../contexts/MenuContext';

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useMenu();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 生成新的分类ID
  const generateCategoryId = () => {
    const maxId = Math.max(...categories.map(c => parseInt(c.id) || 0), 0);
    return (maxId + 1).toString();
  };

  // 获取新的排序号
  const getNextOrder = () => {
    const maxOrder = Math.max(...categories.map(c => c.order), 0);
    return maxOrder + 1;
  };

  // 处理添加分类
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: generateCategoryId(),
      name: newCategoryName.trim(),
      order: getNextOrder()
    };

    addCategory(newCategory);
    setNewCategoryName('');
    setShowAddForm(false);
  };

  // 处理编辑分类
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  // 保存编辑后的分类
  const handleSaveEdit = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    updateCategory(editingCategory.id, {
      name: editingCategory.name.trim()
    });
    setEditingCategory(null);
  };

  // 处理删除分类
  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`确定要删除分类"${category.name}"吗？删除后该分类下的所有菜品将需要重新分类。`)) {
      deleteCategory(category.id);
    }
  };

  // 调整分类顺序
  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedCategories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentCategory = sortedCategories[currentIndex];
    const targetCategory = sortedCategories[newIndex];

    // 交换排序号
    updateCategory(currentCategory.id, { order: targetCategory.order });
    updateCategory(targetCategory.id, { order: currentCategory.order });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // 取消添加
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">分类管理</h2>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            <span>添加分类</span>
          </button>
        )}
      </div>

      {/* 添加分类表单 */}
      {showAddForm && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-medium text-gray-800">添加新分类</h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="请输入分类名称"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              保存
            </button>
            <button
              onClick={handleCancelAdd}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      <div className="space-y-3">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                {/* 排序按钮 */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleMoveCategory(category.id, 'up')}
                    disabled={index === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMoveCategory(category.id, 'down')}
                    disabled={index === categories.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                </div>

                {/* 分类信息 */}
                <div className="flex-1">
                  {editingCategory?.id === category.id ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editingCategory.name.trim()}
                        className="rounded-md bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600 disabled:bg-gray-300"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="rounded-md bg-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-400"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-500">排序: {category.order}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              {editingCategory?.id !== category.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="rounded-md bg-red-50 p-2 text-red-500 hover:bg-red-100"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          暂无分类，请添加分类
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 