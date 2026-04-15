import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 👇 新增下面这段 server 配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的 Java 后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 发送请求时把 /api 去掉
      }
    }
  }
})