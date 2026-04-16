import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:8080', // 你的后端地址
    timeout: 5000
})

// 🔥 请求拦截器：每次发请求前，都会自动执行这里的代码
request.interceptors.request.use(config => {
    // 从浏览器的 localStorage 拿出登录时存的 token
    const token = localStorage.getItem('token')
    
    // 如果 token 存在，就把它塞进请求头里！名字必须跟后端要的一致（咱们后端叫 'token'）
    if (token) {
        config.headers['token'] = token 
    }
    
    return config
}, error => {
    return Promise.reject(error)
})

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