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
      path: '/',      // 根路径，直接指向大本营
      name: 'layout',
      component: LayoutView
    }
  ]
})

// 🔥 极其关键：前端路由守卫（保安）
router.beforeEach((to, from, next) => {
  // 从本地仓库拿出通行证
  const token = localStorage.getItem('token')

  // 如果你要去的地方不是登录页，并且你手里没有 Token，直接踢回登录页！
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    // 否则放行
    next()
  }
})

export default router