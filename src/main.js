import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. 引入 Element Plus 和它的样式文件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
// 2. 把 Element Plus 装载到咱们的 Vue 应用中
app.use(ElementPlus) 

app.mount('#app')