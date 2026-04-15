import axios from 'axios'

// 创建一个 Axios 实例
const request = axios.create({
  baseURL: '/api', 
  timeout: 5000    
})

// 🔥 新增：请求拦截器（出门前自动带上通行证）
request.interceptors.request.use(
  config => {
    // 从本地仓库拿出 token
    const token = localStorage.getItem('token');
    if (token) {
      // 🌟 绝杀：严格按照 JWT 国际标准，加上 Bearer 前缀和空格！
      config.headers['Authorization'] = `Bearer ${token}`; 
      
      // 保险起见，把你之前可能自定义的裸 token 头也带上
      config.headers['token'] = token; 
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

// 响应拦截器：帮我们自动剥离外层，直接返回后端的数据
request.interceptors.response.use(
  response => {
    return response.data; 
  },
  error => {
    return Promise.reject(error);
  }
)

export default request