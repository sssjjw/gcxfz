# Firebase 配置故障排查指南

## 问题描述

当前遇到的Firebase Firestore连接错误：
- 错误代码：400 (Bad Request)
- 错误URL包含异常字符：`database=projects%2F%09gcxfz-restaurant%2Fdatabases%2F(default)`
- 其中`%09`是TAB字符，导致项目ID格式错误

## 问题原因

Firebase配置中的`projectId`包含了意外的空白字符（TAB字符），这通常是在设置GitHub Secrets时复制粘贴导致的。

## 解决方案

### 1. 立即修复

我们已经在代码中添加了自动清理功能：

```typescript
// 清理配置值，移除可能的空白字符和特殊字符
const cleanConfigValue = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  return value.replace(/\s/g, '').trim();
};
```

### 2. 验证当前配置

访问 [Firebase测试页面](https://sssjjw.github.io/gcxfz/firebase-test.html) 查看详细的配置验证信息。

### 3. 清理GitHub Secrets

在GitHub仓库设置中重新设置以下环境变量：

**Repository → Settings → Secrets and variables → Actions → Repository secrets**

```
VITE_FIREBASE_API_KEY=AIzaSyBwgWBxCIarv1kO0kXpUuXCAA7TaVvbqrA
VITE_FIREBASE_AUTH_DOMAIN=gcxfz-restaurant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gcxfz-restaurant
VITE_FIREBASE_STORAGE_BUCKET=gcxfz-restaurant.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=112720952941
VITE_FIREBASE_APP_ID=1:112720952941:web:ab4e3dce42b152edba0964
```

### 4. 验证工具

使用验证脚本检查环境变量：

```bash
node scripts/validate-env.cjs
```

## Firebase项目配置

### Firestore规则

已创建`firestore.rules`文件，允许开发环境的读写访问：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 部署Firestore规则

在Firebase控制台中部署规则：

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 选择项目 `gcxfz-restaurant`
3. 进入 Firestore Database
4. 点击 "规则" 标签
5. 复制粘贴`firestore.rules`的内容
6. 点击 "发布"

### 或使用Firebase CLI

```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录Firebase
firebase login

# 初始化项目
firebase init

# 部署规则
firebase deploy --only firestore:rules
```

## 测试验证

1. **配置验证**: 访问 [Firebase测试页面](https://sssjjw.github.io/gcxfz/firebase-test.html)
2. **数据读写测试**: 测试菜单数据的读取和写入
3. **控制台检查**: 确认没有400错误

## 常见问题

### Q: 仍然看到localStorage模式？
A: 这是正常的降级机制，当Firebase连接失败时会自动切换到本地存储。

### Q: 如何确认Firebase连接成功？
A: 查看控制台日志，应该看到"🔥 Firebase已成功初始化"而不是"💾 使用localStorage模式"。

### Q: 数据没有同步到云端？
A: 检查Firestore规则是否正确部署，确保允许读写访问。

## 监控和调试

### 控制台日志

正常情况下应该看到：
```
🔥 使用Firebase云端数据存储
🔧 Firebase配置验证: {...}
🔥 Firebase已成功初始化
🔄 正在从Firebase加载菜单数据...
```

### 错误日志

如果看到以下错误，说明配置仍有问题：
```
WebChannelConnection RPC 'Listen' stream transport errored
GET https://firestore.googleapis.com/...projects%2F%09gcxfz-restaurant... 400 (Bad Request)
```

## 联系支持

如果问题仍然存在，请检查：
1. Firebase项目是否正确创建
2. API密钥是否有效
3. 项目配额是否充足
4. 网络连接是否正常 