<template>
  <div class="app-container">
    <el-card shadow="never" class="search-box">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="操作人">
          <el-input v-model="queryParams.username" placeholder="输入操作人账号搜索" clearable @keyup.enter="getList" />
        </el-form-item>
        <el-form-item label="操作内容">
          <el-input v-model="queryParams.operation" placeholder="如：删除人才档案" clearable @keyup.enter="getList" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getList">查询审计日志</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-box">
      <template #header>
        <div style="font-weight: bold; font-size: 16px;">
          <el-icon style="margin-right: 5px; color: #409eff;"><Monitor /></el-icon>
          系统动态与安全审计追踪
        </div>
      </template>

      <el-table :data="logList" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="操作人账号" width="150" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.username }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作动作" width="180">
          <template #default="scope">
            <span style="font-weight: bold; color: #f56c6c;" v-if="scope.row.operation.includes('删除')">{{ scope.row.operation }}</span>
            <span style="font-weight: bold; color: #67c23a;" v-else-if="scope.row.operation.includes('新增') || scope.row.operation.includes('保存')">{{ scope.row.operation }}</span>
            <span style="font-weight: bold; color: #409eff;" v-else>{{ scope.row.operation }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="后端执行方法" min-width="250" show-overflow-tooltip />
        <el-table-column prop="params" label="请求参数 (JSON)" min-width="200" show-overflow-tooltip />
        <el-table-column prop="time" label="耗时(ms)" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.time > 1000 ? 'danger' : (scope.row.time > 200 ? 'warning' : 'success')">
              {{ scope.row.time }} ms
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="140" align="center" />
        <el-table-column prop="createTime" label="操作时间" width="180" align="center" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="queryParams.current"
          :page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @update:current-page="val => queryParams.current = val"
          @update:page-size="val => queryParams.size = val"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { Monitor } from '@element-plus/icons-vue'

const loading = ref(false)
const logList = ref([])
const total = ref(0)

const queryParams = reactive({
  current: 1,
  size: 10,
  username: '',
  operation: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-log/page', { params: queryParams })
    if (res.code === 200) {
      logList.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.username = ''
  queryParams.operation = ''
  queryParams.current = 1
  getList()
}

const handleSizeChange = (val) => {
  queryParams.size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.current = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.search-box {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>