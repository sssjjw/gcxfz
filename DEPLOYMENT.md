# 🚀 美食之家点餐系统部署指南

本指南将帮助您将点餐系统部署到GitHub Pages，并配置Firebase作为后端数据库。

## 📋 部署前准备

### 1. Firebase 项目设置

#### 创建 Firebase 项目
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称（如：`restaurant-ordering-system`）
4. 根据需要选择是否启用Google Analytics
5. 创建项目

#### 配置 Firestore 数据库
1. 在 Firebase 控制台中，选择"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（稍后可以修改安全规则）
4. 选择离您最近的服务器位置

#### 获取 Firebase 配置信息
1. 在 Firebase 控制台中，点击项目设置图标（齿轮图标）
2. 选择"项目设置"
3. 滚动到"您的应用"部分
4. 点击"添加应用" > 选择 Web 图标 (</>)
5. 输入应用昵称，勾选"同时为此应用设置Firebase Hosting"
6. 复制显示的配置对象，类似于：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. GitHub 仓库设置

#### 创建 GitHub 仓库
1. 在 GitHub 上创建新仓库
2. 仓库名称建议：`restaurant-ordering-system`
3. 设置为公开仓库（用于 GitHub Pages）

#### 配置 GitHub Secrets
在 GitHub 仓库中设置以下 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击"New repository secret"添加以下变量：

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_FIREBASE=true
```

#### 启用 GitHub Pages
1. 仓库 → Settings → Pages
2. Source 选择"GitHub Actions"

## 🛠️ 部署步骤

### 1. 更新项目配置

更新 `vite.config.ts` 中的仓库名称：
```typescript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```
将 `your-repo-name` 替换为您的实际仓库名称。

### 2. 推送代码到 GitHub

```bash
# 初始化 git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo-name.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Restaurant ordering system"

# 推送到主分支
git push -u origin main
```

### 3. 自动部署

一旦代码推送到 `main` 分支，GitHub Actions 会自动：
1. 安装依赖
2. 构建项目
3. 部署到 GitHub Pages

您可以在仓库的 "Actions" 标签页查看部署进度。

### 4. 数据迁移（可选）

如果您有现有的 localStorage 数据需要迁移到 Firebase：

1. 在部署的网站中，打开浏览器开发者工具
2. 在控制台中运行：
```javascript
// 获取 OrderContext 实例
const { migrateToFirebase } = useOrder();
await migrateToFirebase();
```

## 🔧 本地开发配置

### 使用 Firebase 模式
创建 `.env.local` 文件：
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_FIREBASE=true
```

### 使用 localStorage 模式（开发）
创建 `.env.local` 文件：
```
VITE_USE_FIREBASE=false
```

## 🔐 Firebase 安全规则

在生产环境中，建议配置适当的 Firestore 安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许读取所有文档
    match /{document=**} {
      allow read: if true;
    }
    
    // 订单文档
    match /orders/{orderId} {
      allow write: if true; // 根据需要调整
    }
    
    // 菜单文档
    match /menuItems/{itemId} {
      allow write: if true; // 建议只允许管理员写入
    }
    
    // 设置文档
    match /settings/{settingId} {
      allow write: if true; // 建议只允许管理员写入
    }
    
    // 删除记录
    match /deletedOrders/{orderId} {
      allow write: if true;
    }
  }
}
```

## 📱 访问部署的网站

部署完成后，您的网站将在以下地址可用：
```
https://your-username.github.io/your-repo-name/
```

## 🎯 功能特性

### 客户端功能
- 📋 菜品浏览和分类
- 🛒 购物车管理
- 📝 订单提交
- 📢 公告展示
- 💰 价格计算和优惠

### 管理后台功能
- 📊 订单管理和状态更新
- 🍽️ 菜品管理
- 📈 数据统计和报表导出
- ⚙️ 系统设置
- 🔔 实时订单通知

### 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **构建工具**: Vite
- **后端**: Firebase Firestore
- **部署**: GitHub Pages + GitHub Actions
- **状态管理**: React Context API

## 🐛 故障排除

### 常见问题

#### 1. 部署失败
- 检查 GitHub Secrets 是否正确设置
- 确认 Firebase 配置信息是否正确
- 查看 Actions 日志获取详细错误信息

#### 2. Firebase 连接失败
- 验证 Firebase 项目配置
- 确认 Firestore 数据库已创建
- 检查网络连接和防火墙设置

#### 3. 路由问题
- 确认 `vite.config.ts` 中的 `base` 路径正确
- GitHub Pages 路径应该匹配仓库名称

#### 4. 环境变量问题
- 确认所有 `VITE_` 前缀的环境变量都已设置
- 本地开发时检查 `.env.local` 文件

### 调试提示

1. **开发者工具**: 使用浏览器开发者工具查看控制台错误
2. **网络面板**: 检查 API 请求是否成功
3. **Firebase 控制台**: 查看 Firestore 数据是否正确同步
4. **GitHub Actions**: 查看构建和部署日志

## 🚀 性能优化建议

1. **图片优化**: 使用适当格式和大小的图片
2. **代码分割**: 利用 Vite 的自动代码分割功能
3. **缓存策略**: 配置适当的浏览器缓存
4. **Firebase 索引**: 为常用查询创建 Firestore 索引

## 📞 技术支持

如果遇到问题，请检查：
1. Firebase 控制台的项目配置
2. GitHub Actions 的构建日志
3. 浏览器开发者工具的错误信息
4. 网络连接和 DNS 设置

---

🎉 **恭喜！您的美食之家点餐系统现已成功部署到线上！** 