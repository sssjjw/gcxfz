# 餐厅点餐系统

一个现代化的餐厅点餐系统，具有客户点餐和管理员管理的双界面设计。

## 功能特点

### 客户端功能
- 浏览菜单分类和菜品
- 添加商品到购物车
- 选择菜品规格和特殊要求
- 查看购物车和结算
- 查看订单确认和取餐码

### 管理员功能
- 管理员账户登录（测试账号: admin / 密码: password）
- 实时查看和管理订单
- 按状态和日期筛选订单
- 更新订单状态（待处理、制作中、可取餐、已完成）
- 菜单管理（添加/编辑/删除菜品和分类）

## 技术栈

- **前端**: React, TypeScript, Tailwind CSS
- **状态管理**: React Context API
- **路由**: React Router
- **构建工具**: Vite
- **数据持久化**: localStorage

## 安装与运行

### 前提条件
- Node.js >= 18.17.1
- npm >= 9.6.7

### 安装依赖
```bash
npm install
```

### 开发环境启动
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
src/
├── contexts/         # 全局状态管理
│   ├── AuthContext.tsx     # 认证状态
│   ├── CartContext.tsx     # 购物车管理
│   ├── MenuContext.tsx     # 菜单数据管理
│   └── OrderContext.tsx    # 订单管理
│
├── pages/            # 页面组件
│   ├── admin/        # 管理员界面
│   │   ├── components/    # 管理端组件
│   │   └── views/         # 管理视图
│   └── customer/     # 客户界面
│       └── components/    # 客户端组件
│
├── App.tsx           # 主应用组件
└── main.tsx          # 应用入口
```

## 部署

详细部署说明请参阅 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 使用指南

### 客户使用流程
1. 通过首页进入客户界面
2. 浏览菜单并添加商品到购物车
3. 点击右下角购物袋图标打开购物车
4. 调整商品数量和规格
5. 点击"去结算"完成订单
6. 查看取餐码和订单确认信息

### 管理员使用流程
1. 访问 `/admin/login` 页面
2. 使用管理员账号登录（admin / password）
3. 在仪表板查看订单概况
4. 在"订单管理"页面处理订单
5. 在"菜单管理"页面编辑菜单

## 注意事项

- 此项目使用localStorage存储数据，刷新页面不会丢失数据
- 多用户访问时，每个客户端的数据相互独立
- 此项目主要为演示目的，生产环境使用建议添加后端服务 