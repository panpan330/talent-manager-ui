<template>
  <div class="layout-container">
    <el-container>
      <el-aside width="240px" class="aside">
        <div class="logo">
          <el-icon color="#409EFF" size="24"><DataAnalysis /></el-icon>
          <span>交叉人才管理</span>
        </div>
        
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          router
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>能力评估看板</span>
          </el-menu-item>
          
          <el-menu-item index="/talent">
            <el-icon><User /></el-icon>
            <span>人才档案管理</span>
          </el-menu-item>
          
          <el-menu-item index="/match">
            <el-icon><Cpu /></el-icon>
            <span>智能人才撮合</span>
          </el-menu-item>

          <el-menu-item index="/project">
            <el-icon><Management /></el-icon>
            <span>项目与需求匹配</span>
          </el-menu-item>

          <el-menu-item index="/notice">
            <el-icon><Bell /></el-icon>
            <span>系统消息中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                欢迎回来，超级管理员 <el-icon><ArrowDown /></el-icon>
              </span>
              <template #footer>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { 
  DataAnalysis, Odometer, User, Cpu, 
  Management, Bell, ArrowDown 
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.clear() // 清除 Token 和 Role
    router.push('/login')
  })
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  border-bottom: 1px solid #1f2d3d;
}

.logo span {
  margin-left: 10px;
}

.el-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.user-info {
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.main {
  background-color: #f0f2f5;
  padding: 0; /* 内部页面自己定义 padding */
  overflow-y: auto;
}
</style>