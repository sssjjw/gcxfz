#!/usr/bin/env node

// 验证和清理环境变量的脚本
const fs = require('fs');
const path = require('path');

// 期望的Firebase配置
const expectedConfig = {
  VITE_FIREBASE_API_KEY: "AIzaSyBwgWBxCIarv1kO0kXpUuXCAA7TaVvbqrA",
  VITE_FIREBASE_AUTH_DOMAIN: "gcxfz-restaurant.firebaseapp.com", 
  VITE_FIREBASE_PROJECT_ID: "gcxfz-restaurant",
  VITE_FIREBASE_STORAGE_BUCKET: "gcxfz-restaurant.firebasestorage.app",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "112720952941",
  VITE_FIREBASE_APP_ID: "1:112720952941:web:ab4e3dce42b152edba0964"
};

// 清理函数
function cleanValue(value) {
  if (!value) return value;
  return value.replace(/\s/g, '').trim();
}

// 验证函数
function validateEnvValue(key, value) {
  const clean = cleanValue(value);
  const expected = expectedConfig[key];
  
  console.log(`\n验证 ${key}:`);
  console.log(`  原始值: "${value}"`);
  console.log(`  清理后: "${clean}"`);
  console.log(`  期望值: "${expected}"`);
  console.log(`  字符编码: ${Array.from(value).map(c => c.charCodeAt(0).toString(16)).join(' ')}`);
  
  if (clean !== expected) {
    console.log(`  ❌ 不匹配`);
    return false;
  } else {
    console.log(`  ✅ 匹配`);
    return true;
  }
}

// 生成GitHub Actions环境变量设置命令
function generateGitHubCommands() {
  console.log('\n🔧 GitHub Actions环境变量设置命令:');
  console.log('请在GitHub仓库设置中的Secrets and variables > Actions中设置以下变量：\n');
  
  Object.entries(expectedConfig).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n或者使用GitHub CLI命令：');
  Object.entries(expectedConfig).forEach(([key, value]) => {
    console.log(`gh secret set ${key} --body "${value}"`);
  });
}

// 主函数
function main() {
  console.log('🔍 Firebase环境变量验证工具');
  console.log('================================');
  
  // 读取.env文件（如果存在）
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    console.log('📄 读取.env文件');
    try {
      require('dotenv').config({ path: envFile });
    } catch (e) {
      console.log('  ⚠️  dotenv包未安装，跳过.env文件读取');
    }
  } else {
    console.log('📄 未找到.env文件，使用系统环境变量');
  }
  
  let allValid = true;
  
  // 验证每个环境变量
  Object.keys(expectedConfig).forEach(key => {
    const value = process.env[key];
    if (!value) {
      console.log(`\n❌ 缺失环境变量: ${key}`);
      allValid = false;
    } else {
      if (!validateEnvValue(key, value)) {
        allValid = false;
      }
    }
  });
  
  if (allValid) {
    console.log('\n✅ 所有环境变量验证通过');
  } else {
    console.log('\n❌ 环境变量验证失败');
    generateGitHubCommands();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { validateEnvValue, cleanValue, expectedConfig }; 