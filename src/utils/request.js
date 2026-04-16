import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 1. 创建一个 axios 实例对象
const request = axios.create({
  baseURL: 'http://localhost:8080', // 你的 SpringBoot 后端地址
  timeout: 10000 // 请求超时时间：10秒
})

// 2. 请求拦截器 (Request Interceptor)
// 在请求发送到后端之前，做一些处理，比如加上 JWT Token
// 2. 请求拦截器 (Request Interceptor)
request.interceptors.request.use(
  config => {
    // 从浏览器的 localStorage 里拿到咱们登录时存的 token
    const token = localStorage.getItem('token')
    if (token) {
      // 🔥 修改了这里：必须和后端 JwtAuthenticationFilter 里的 getHeader("token") 完全一致！
      config.headers['token'] = token 
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (Response Interceptor)
// 在后端把数据传回前端，组件拿到数据之前，咱们先统一处理一下
request.interceptors.response.use(
  response => {
    let res = response.data
    // 如果返回的类型是文件流（比如导出 Excel），直接返回
    if (response.config.responseType === 'blob') {
      return res
    }
    
    // 如果 res 还是字符串，咱们试着把它转成 JSON 对象
    if (typeof res === 'string') {
      res = res ? JSON.parse(res) : res
    }
    
    // 🔥 全局统一错误处理
    if (res.code === 401) {
        // 如果后端返回 401，说明 Token 过期或者没带 Token
        ElMessage.error('登录状态已过期，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
    } else if (res.code !== 200) {
        // 其他业务错误（比如账号密码错误），统一用 Element Plus 弹窗提示
        ElMessage.error(res.msg || '系统错误')
    }

    return res
  },
  error => {
    console.error('response error:', error) // 打印错误方便调试
    ElMessage.error('网络请求异常，请检查后端是否启动')
    return Promise.reject(error)
  }
)

// 🔥 极其重要的一步：必须把这个 request 对象作为默认导出！
// 这样别人 import request from '../utils/request' 时，才能拿到带有 get, post 方法的 axios 实例！
export default request