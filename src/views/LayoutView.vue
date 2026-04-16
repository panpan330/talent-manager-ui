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
          :default-active="route.path"
          text-color="#fff"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>能力评估看板</span>
          </el-menu-item>
          
          <el-menu-item index="/talent" v-if="userRole === 'admin'">
            <el-icon><User /></el-icon>
            <span>人才档案管理</span>
          </el-menu-item>
          <el-menu-item index="/match" v-if="userRole === 'admin'">
            <el-icon><Aim /></el-icon>
            <span>智能人才撮合</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <el-header class="header-bar">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <span class="welcome-text" style="margin-right: 15px;">欢迎回来，超级管理员</span>
            <el-button type="danger" size="small" plain @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>

        <div class="tabs-bar">
          <el-tabs
            v-model="activeTab"
            type="card"
            @tab-click="clickTab"
            @tab-remove="removeTab"
          >
            <el-tab-pane
              v-for="item in visitedTabs"
              :key="item.path"
              :label="item.title"
              :name="item.path"
              :closable="item.path !== '/dashboard'"
            ></el-tab-pane>
          </el-tabs>
        </div>

        <el-main class="main-content">
          <el-card shadow="never" class="work-area">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { User, DataLine, Aim } from '@element-plus/icons-vue' // 加了 Aim 图标
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 在 script 里的顶部加上这行：
const userRole = localStorage.getItem('role')
const route = useRoute()
const router = useRouter()

// ==== 多页签 (Tabs) 核心逻辑 ====
const activeTab = ref(route.path)
// 默认强制保留“看板”页作为初始页签
const visitedTabs = ref([
  { title: '能力评估看板', path: '/dashboard' }
])

// 监听网址变化，如果去了新页面，就把新页面塞进页签列表里
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath
    // 检查这个页面是不是已经在页签里了
    const exists = visitedTabs.value.find(tab => tab.path === newPath)
    if (!exists && route.meta.title) {
      visitedTabs.value.push({
        title: route.meta.title,
        path: newPath
      })
    }
  },
  { immediate: true }
)

// 点击页签时，跳转到对应的路由
const clickTab = (tab) => {
  router.push(tab.props.name)
}

// 点击 X 关闭页签时的逻辑
const removeTab = (targetName) => {
  const tabs = visitedTabs.value
  let activeName = activeTab.value

  // 如果你关掉的是当前正在看的页面，我们需要自动帮你跳到旁边的一个页面
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.path === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.path
        }
      }
    })
  }

  activeTab.value = activeName
  visitedTabs.value = tabs.filter(tab => tab.path !== targetName)
  router.push(activeName) // 触发跳转
}

// ==== 退出登录逻辑 ====
const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已安全退出系统')
  router.push('/login')
}
</script>

<style scoped>
.layout-container { height: 100vh; width: 100vw; overflow: hidden; }
.full-height { height: 100%; }
.aside-menu { background-color: #191a23; color: white; transition: width 0.3s; }
.logo-box { height: 60px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #fff; border-bottom: 1px solid #282a35; }
.logo-icon { font-size: 24px; margin-right: 8px; }
.el-menu-vertical { border-right: none; }
.main-container { display: flex; flex-direction: column; overflow: hidden; }

/* 顶栏样式 */
.header-bar { background-color: #ffffff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 50px; }
.welcome-text { font-size: 14px; color: #606266; font-weight: 500; }

/* 多页签栏样式 */
.tabs-bar { background-color: #fff; padding: 6px 20px 0; border-bottom: 1px solid #dcdfe6; }
/* 覆盖 Element Plus 默认的粗边框，让页签更清爽 */
:deep(.el-tabs__header) { margin-bottom: 0; border-bottom: none; }

/* 主区域底色 */
.main-content { background-color: #f0f2f5; padding: 15px; overflow-y: auto; }
.work-area { min-height: calc(100vh - 150px); border-radius: 8px; }
</style>