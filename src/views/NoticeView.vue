<template>
  <div class="notice-container">
    <div class="header-box">
      <h2>🔔 系统消息中心</h2>
      <el-button icon="Check" @click="markAllRead" type="success" plain>全部标记已读</el-button>
    </div>

    <el-card shadow="never" class="notice-card">
      <el-tabs v-model="activeTab">
        <!-- 现有系统通知 -->
        <el-tab-pane label="系统通知" name="system">
          <div v-loading="loading">
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
          </div>
        </el-tab-pane>

        <!-- 项目邀请处理 (仅学生端显示) -->
        <el-tab-pane label="项目邀请" name="invite" v-if="isStudent">
          <div v-loading="inviteLoading">
            <el-table :data="inviteList" border stripe>
              <el-table-column prop="projectName" label="项目名称" min-width="150" />
              <el-table-column label="匹配度" width="120" align="center">
                <template #default="scope">
                  <el-progress :percentage="scope.row.matchScore" />
                </template>
              </el-table-column>
              <el-table-column label="邀请时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="120" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.status === 1" type="warning">待处理</el-tag>
                  <el-tag v-else-if="scope.row.status === 2" type="danger">已拒绝</el-tag>
                  <el-tag v-else-if="scope.row.status === 3" type="success">已接受</el-tag>
                  <el-tag v-else-if="scope.row.status === 4" type="info" effect="plain">已取消</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                  <div v-if="scope.row.status === 1">
                    <el-button type="success" size="small" @click="handleInvite(scope.row.id, 3)">接受</el-button>
                    <el-button type="danger" size="small" @click="handleInvite(scope.row.id, 2)">拒绝</el-button>
                  </div>
                  <span v-else style="color: #909399; font-size: 13px;">已处理</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Message, ChatSquare, DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const noticeList = ref([])
const activeTab = ref('system')
const isStudent = ref(localStorage.getItem('role') === 'student')

const inviteList = ref([])
const inviteLoading = ref(false)

// 获取消息列表
const fetchNotices = async () => {
  loading.value = true
  try {
    const talentId = localStorage.getItem('talentId')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    
    // 如果是超级管理员，可能想要查看所有消息？或者管理员只能看发给管理员的/广播消息
    // 这里为了安全隔离，专家和企业只看自己的
    const params = {}
    if (talentId) params.talentId = talentId
    if (userId && role !== 'admin') params.userId = userId

    const res = await request.get('/sys-notice/list', { params })
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

const fetchInvites = async () => {
  const talentId = localStorage.getItem('talentId')
  if (!talentId) return
  inviteLoading.value = true
  try {
    const res = await request.get(`/biz-match-record/list-talent/${talentId}`)
    if (res.code === 200) {
      inviteList.value = res.data || []
    }
  } catch (error) {
    console.error('获取邀请记录失败', error)
  } finally {
    inviteLoading.value = false
  }
}

const handleInvite = async (recordId, status) => {
  try {
    const res = await request.post(`/biz-match-record/handle-invite/${recordId}?status=${status}`)
    if (res.code === 200) {
      ElMessage.success('操作成功')
      fetchInvites() // 刷新列表
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  }
}

// 简单的时间格式化处理
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

onMounted(() => {
  fetchNotices()
  if (isStudent.value) {
    fetchInvites()
  }
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