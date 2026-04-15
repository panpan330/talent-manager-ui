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
      redirect: '/talent', // 默认一进来就展示人才档案页
      children: [
        {
          path: 'talent', // 注意这里不带斜杠
          name: 'talent',
          // 动态导入刚刚建的页面
          component: () => import('../views/TalentProfile.vue') 
        }
      ]
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