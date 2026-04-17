import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    // 路由懒加载：只有访问登录页时才加载该组件代码，提升首页加载速度
    component: () => import('../views/LoginView.vue'),
    meta: { title: '系统登录' }
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('../views/LayoutView.vue'),
    redirect: () => {
      // 动态判断，如果是学生则跳转到学生专属主页，否则去全局数据大屏
      return localStorage.getItem('role') === 'student' ? '/student-dashboard' : '/dashboard'
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: '数据大屏看板' }
      },
      {
        path: 'student-dashboard',
        name: 'student-dashboard',
        component: () => import('../views/StudentDashboard.vue'),
        meta: { title: '我的个人主页' }
      },
      {
        path: 'talent',
        name: 'talent',
        component: () => import('../views/TalentProfile.vue'),
        meta: { title: '人才档案管理' }
      },
      {
        path: 'match',
        name: 'match',
        component: () => import('../views/SmartMatch.vue'),
        // 🔥 meta 属性：用来给这个路由打上“需要管理员权限”的标签
        meta: { title: '智能人才撮合', requireAdmin: true }
      },
      {
        path: 'project',
        name: 'ProjectManage',
        component: () => import('../views/ProjectManage.vue'),
        meta: { title: '项目与需求匹配' }
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('../views/UserManage.vue'),
        meta: { title: '系统账号管理', requireAdmin: true }
      },
      {
        path: 'notice',
        name: 'notice',
        component: () => import('../views/NoticeView.vue'),
        meta: { title: '系统消息中心' }
      },
      {
          path: 'dict',
          name: 'DictManage',
          component: () => import('../views/DictManage.vue'),
          meta: { title: '系统数据字典', requireAdmin: true }
        },
        {
          path: 'log',
          name: 'LogView',
          component: () => import('../views/LogView.vue'),
          meta: { title: '系统安全与审计日志', requireAdmin: true }
        }
      ]
  },
  {
    // 捕获所有不存在的路由，跳转到首页 (或者你可以自己写个 404 页面)
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 🔥 核心亮点：Vue 3 + Vue Router 4 的全新路由守卫 (不再使用 next())
router.beforeEach((to, from) => {
  // 设置网页浏览器的标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - 交叉人才管理系统'
  }

  // 从本地存储获取通行证和角色
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // 假设登录时保存了角色，如 'admin' 或 'user'

  // 1. 如果没有 Token，且不是去登录页，强制打回登录页！
  if (to.path !== '/login' && !token) {
    // Vue Router 4 推荐直接 return 路径字符串，而不是调 next('/login')
    return '/login' 
  }

  // 2. 如果已经登录了（有 Token），还想硬往登录页挤，直接把他送到首页
  if (to.path === '/login' && token) {
    return '/dashboard'
  }

  // 3. 🔥 RBAC (基于角色的权限控制) 核心拦截
  // 如果去的页面需要管理员权限，但当前用户不是 admin，踢回首页
  if (to.meta.requireAdmin && role !== 'admin') {
    alert('⚠️ 越权访问拦截：您的权限不足以查看该页面！')
    return role === 'student' ? '/student-dashboard' : '/dashboard' 
  }

  // 4. 全部检查通过，什么都不返回，Vue Router 会默认放行
})

export default router