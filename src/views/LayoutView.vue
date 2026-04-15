<template>
  <div class="layout-container">
    <el-container class="full-height">
      <el-aside width="220px" class="aside-menu">
        <div class="logo-box">
          <span class="logo-icon">🧬</span>
          <span class="logo-text">交叉人才管理</span>
        </div>
        <el-menu
          active-text-color="#409eff"
          background-color="#191a23"
          class="el-menu-vertical"
          default-active="1"
          text-color="#fff"
        >
          <el-menu-item index="1">
            <el-icon><User /></el-icon>
            <span>人才档案管理</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><DataLine /></el-icon>
            <span>能力评估看板</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header-bar">
          <div class="header-left">
            <span class="welcome-text">欢迎回来，超级管理员</span>
          </div>
          <div class="header-right">
            <el-button type="danger" size="small" plain @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <el-card shadow="never" class="work-area">
            <h1>这是系统的主工作区</h1>
            <p>以后你写的人才表格、可视化图表，都会渲染在这里面！</p>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { User, DataLine } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 退出登录逻辑
const handleLogout = () => {
  // 1. 撕毁本地的 Token 通行证
  localStorage.removeItem('token')
  // 2. 提示并跳回登录页
  ElMessage.success('已安全退出系统')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}
.full-height {
  height: 100%;
}
/* 侧边栏样式：高级深色系 */
.aside-menu {
  background-color: #191a23;
  color: white;
  transition: width 0.3s;
}
.logo-box {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #282a35;
}
.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}
.el-menu-vertical {
  border-right: none; /* 去掉自带的白边 */
}
/* 顶栏样式：干净明亮 */
.header-bar {
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.welcome-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
/* 主区域底色 */
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
.work-area {
  min-height: calc(100vh - 100px);
  border-radius: 8px;
}
</style>