<template>
  <div class="notice-container">
    <div class="header-box">
      <h2>🔔 系统消息中心</h2>
      <el-button icon="Check" @click="markAllRead" type="success" plain>全部标记已读</el-button>
    </div>

    <el-card shadow="never" class="notice-card" v-loading="loading">
      <el-empty v-if="noticeList.length === 0" description="暂无任何系统消息" />
      
      <div v-for="item in noticeList" :key="item.noticeId" class="notice-item" :class="{ 'is-read': item.status === 1 }">
        <div class="notice-icon">
          <el-badge :is-dot="item.status === 0" class="item">
            <el-icon size="24" :color="item.status === 0 ? '#409EFF' : '#909399'">
              <Message v-if="item.status === 0" />
              <ChatSquare v-else />
            </el-icon>
          </el-badge>
        </div>
        
        <div class="notice-content">
          <div class="notice-title">
            {{ item.noticeTitle }}
            <el-tag v-if="item.status === 0" type="danger" size="small" effect="dark" class="status-tag">未读</el-tag>
          </div>
          <div class="notice-desc">{{ item.noticeContent }}</div>
          <div class="notice-time">{{ formatDate(item.createTime) }}</div>
        </div>
        
        <div class="notice-action">
          <el-button v-if="item.status === 0" type="primary" link @click="handleRead(item.noticeId)">
            标为已读
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Message, ChatSquare } from '@element-plus/icons-vue'

const loading = ref(false)
const noticeList = ref([])

// 获取消息列表
const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-notice/list')
    if (res.code === 200) {
      noticeList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

// 标为已读
const handleRead = async (id) => {
  const res = await request.put(`/sys-notice/read/${id}`)
  if (res.code === 200) {
    fetchNotices() // 刷新列表
  }
}

// 模拟全部已读 (前端演示用，实际可调用后端批量修改接口)
const markAllRead = () => {
  noticeList.value.forEach(item => {
    if (item.status === 0) handleRead(item.noticeId)
  })
}

// 简单的时间格式化处理
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped>
.notice-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
.header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.notice-card { border-radius: 12px; }

.notice-item {
  display: flex;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}
.notice-item:hover { background-color: #f5f7fa; }
.notice-item:last-child { border-bottom: none; }

/* 已读状态下的整体变灰 */
.notice-item.is-read .notice-title { color: #909399; font-weight: normal; }
.notice-item.is-read .notice-desc { color: #c0c4cc; }

.notice-icon { width: 50px; display: flex; align-items: center; justify-content: center; }
.notice-content { flex: 1; padding: 0 15px; }

.notice-title { font-size: 16px; font-weight: bold; color: #303133; margin-bottom: 8px; display: flex; align-items: center; }
.status-tag { margin-left: 10px; }
.notice-desc { font-size: 14px; color: #606266; line-height: 1.5; margin-bottom: 10px; }
.notice-time { font-size: 12px; color: #909399; }
.notice-action { width: 80px; display: flex; align-items: center; justify-content: flex-end; }
</style>