import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import LayoutView from '../views/LayoutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', // 登录页
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'layout',
      component: LayoutView,
      redirect: '/dashboard', // 建议把默认首页改成 dashboard
      children: [
        {
          path: 'talent', 
          name: 'talent',
          // 🔥 给 meta 加上 requireAdmin: true，代表这是机密重地
          meta: { title: '人才档案管理', requireAdmin: true }, 
          component: () => import('../views/TalentProfile.vue') 
        },
        {
          path: 'dashboard', 
          name: 'dashboard',
          meta: { title: '能力评估看板' }, // 🔥 新增身份证
          component: () => import('../views/DashboardView.vue') 
        }
      ]
    }
  ]
})

// 🔥 极其关键：前端路由守卫（保安）
// 🔥 升级版前端路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // 拿到用户的身份

  // 1. 如果没有 Token，且不是去登录页，踢回登录
  if (to.path !== '/login' && !token) {
    next('/login')
    return
  }

  // 2. 如果他想去机密重地（requireAdmin），但身份不是 admin
  if (to.meta.requireAdmin && role !== 'admin') {
    // 提示无权限，并把他踹回首页(看板)
    alert('⚠️ 越权访问：您的权限不足以查看该页面！')
    next('/dashboard')
    return
  }

  // 3. 检查通过，放行
  next()
})

export default router