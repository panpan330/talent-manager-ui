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
          <el-menu-item v-if="userRole !== 'student'" index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>能力评估看板</span>
          </el-menu-item>

          <el-menu-item v-if="userRole === 'student'" index="/student-dashboard">
            <el-icon><User /></el-icon>
            <span>我的个人主页</span>
          </el-menu-item>
          
          <el-menu-item v-if="userRole === 'admin' || userRole === 'expert'" index="/talent">
            <el-icon><User /></el-icon>
            <span>人才档案管理</span>
          </el-menu-item>
          
          <el-menu-item v-if="userRole === 'admin'" index="/match">
            <el-icon><Cpu /></el-icon>
            <span>智能人才撮合</span>
          </el-menu-item>

          <el-menu-item v-if="userRole === 'admin' || userRole === 'project'" index="/project">
            <el-icon><Management /></el-icon>
            <span>项目与需求匹配</span>
          </el-menu-item>

          <el-menu-item index="/notice">
            <el-icon><Bell /></el-icon>
            <span>系统消息中心</span>
          </el-menu-item>

          <!-- 仅管理员可见 -->
          <el-menu-item v-if="userRole === 'admin'" index="/user">
            <el-icon><Avatar /></el-icon>
            <span>系统账号管理</span>
          </el-menu-item>

          <el-menu-item v-if="userRole === 'admin'" index="/dict">
            <el-icon><Setting /></el-icon>
            <span>系统数据字典</span>
          </el-menu-item>

          <el-menu-item v-if="userRole === 'admin'" index="/log">
            <el-icon><Document /></el-icon>
            <span>操作审计日志</span>
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
            <el-badge :is-dot="hasNewMessage" class="bell-icon" @click="handleOpenMessages" style="cursor: pointer; margin-right: 20px; display: flex; align-items: center;">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
            <el-dropdown trigger="click">
              <span class="user-info">
                <el-avatar :size="28" class="role-avatar">{{ userRole.charAt(0).toUpperCase() }}</el-avatar>
                欢迎回来，{{ 
                  userRole === 'admin' ? '超级管理员' : 
                  userRole === 'expert' ? '教研专家' : 
                  userRole === 'project' ? '科研/项目方' : '交叉人才(学生)' 
                }} 
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
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

    <!-- 消息通知弹窗 -->
    <el-dialog title="系统消息通知" v-model="wsDialogVisible" width="500px">
      <div v-if="wsMessages.length === 0" style="text-align: center; color: #909399; padding: 20px;">
        暂无新消息
      </div>
      <el-timeline v-else>
        <el-timeline-item v-for="(msg, index) in wsMessages" :key="index" :timestamp="msg.time" placement="top">
          <el-card shadow="hover">
            <span style="font-weight: bold; color: #409eff;">{{ msg.content }}</span>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="wsMessages = []; wsDialogVisible = false">清空消息</el-button>
        <el-button type="primary" @click="wsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  DataAnalysis, Odometer, User, Cpu, 
  Management, Bell, ArrowDown, SwitchButton, Avatar, Setting, Document
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userRole = ref(localStorage.getItem('role') || 'user')

// --- WebSocket 消息通知逻辑 ---
const hasNewMessage = ref(false)
const wsMessages = ref([])
const wsDialogVisible = ref(false)
let ws = null

const initWebSocket = () => {
  const userId = localStorage.getItem('userId')
  if (!userId) return

  const wsUrl = `ws://localhost:8080/ws/notify/${userId}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket 连接成功')
  }

  ws.onmessage = (event) => {
    const msg = event.data
    wsMessages.value.unshift({ time: new Date().toLocaleString(), content: msg })
    hasNewMessage.value = true
    
    // 右下角弹窗提醒
    ElNotification({
      title: '您有一条新消息',
      message: msg,
      type: 'success',
      position: 'bottom-right'
    })
  }

  ws.onerror = (e) => {
    console.error('WebSocket 错误', e)
  }
}

const handleOpenMessages = () => {
  hasNewMessage.value = false
  wsDialogVisible.value = true
}

onMounted(() => {
  initWebSocket()
})

onUnmounted(() => {
  if (ws) ws.close()
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.clear() // 清除 Token 和 Role
    ElMessage.success('已安全退出')
    router.push('/login')
  }).catch(() => {
    // 用户取消退出
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
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  gap: 8px;
}

.role-avatar {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #fff;
  font-weight: bold;
}

.main {
  background-color: #f0f2f5;
  padding: 0; /* 内部页面自己定义 padding */
  overflow-y: auto;
}
</style>