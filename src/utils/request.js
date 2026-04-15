import axios from 'axios'

// 创建一个 Axios 实例
const request = axios.create({
  baseURL: '/api', // 配合我们刚才配置的 vite 代理
  timeout: 5000    // 请求超时时间
})

// 响应拦截器：帮我们自动剥离外层，直接返回后端的数据
request.interceptors.response.use(
  response => {
    return response.data; // 直接返回后端的 Result 对象
  },
  error => {
    return Promise.reject(error);
  }
)

export default request