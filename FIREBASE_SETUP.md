# Firebase 项目设置指南

## 问题描述

当前Firebase出现`CONFIGURATION_NOT_FOUND`错误，这通常是因为Firebase项目配置不正确导致的。

## 解决步骤

### 1. 创建新的Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 项目名称：`gcxfz-restaurant` (或其他您喜欢的名称)
4. 选择"继续"
5. 禁用Google Analytics（可选）
6. 点击"创建项目"

### 2. 启用Firestore数据库

1. 在Firebase控制台中，选择刚创建的项目
2. 在左侧菜单中点击"Firestore Database"
3. 点击"创建数据库"
4. 选择"测试模式"（开发环境）
5. 选择地区（建议选择亚洲地区）
6. 点击"完成"

### 3. 配置Web应用

1. 在Firebase控制台中，点击"项目设置"（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"Web"图标（</>）
4. 应用昵称：`gcxfz-web`
5. 勾选"同时为此应用设置Firebase托管"
6. 点击"注册应用"
7. 复制配置代码中的配置对象

### 4. 更新GitHub环境变量

使用从Firebase获取的配置，在GitHub仓库中设置以下环境变量：

**路径：Repository → Settings → Secrets and variables → Actions → Repository secrets**

```
VITE_FIREBASE_API_KEY=你的API密钥
VITE_FIREBASE_AUTH_DOMAIN=你的项目ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的项目ID
VITE_FIREBASE_STORAGE_BUCKET=你的项目ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=你的发送者ID
VITE_FIREBASE_APP_ID=你的应用ID
```

### 5. 更新Firestore安全规则

在Firebase控制台中：

1. 进入"Firestore Database"
2. 点击"规则"标签
3. 将以下规则粘贴到编辑器中：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有读写操作 - 仅用于开发测试
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. 点击"发布"

### 6. 验证设置

1. 等待GitHub Actions完成部署
2. 访问 [Firebase测试页面](https://sssjjw.github.io/gcxfz/firebase-test.html)
3. 检查控制台日志，应该看到：
   - "🔥 Firebase已成功初始化"
   - "✅ Firestore连接成功"
   - 没有400错误

## 常见问题解决

### Q: 仍然看到400错误？
A: 
1. 确保所有环境变量都正确设置
2. 检查项目ID是否包含特殊字符
3. 确保Firestore规则已正确部署

### Q: 如何确认环境变量正确？
A: 运行环境变量验证脚本：
```bash
node scripts/validate-env.cjs
```

### Q: 数据没有保存到Firebase？
A: 
1. 检查控制台是否有错误
2. 确认Firestore安全规则允许写入
3. 验证网络连接

## 生产环境注意事项

⚠️ **重要**：当前的Firestore规则允许所有读写操作，这仅适用于开发环境。

生产环境中，请使用更严格的规则：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许读取操作
    match /{document=**} {
      allow read: if true;
      allow write: if false; // 生产环境中禁止写入
    }
  }
}
```

## 支持联系

如果问题仍然存在，请：
1. 检查Firebase控制台的"使用情况"页面
2. 查看Firebase配额是否充足
3. 确认项目计费状态
4. 检查网络连接和防火墙设置 