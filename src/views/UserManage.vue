<template>
  <div class="app-container">
    <div class="header-box">
      <h2>👥 账号管理中心</h2>
      <el-button type="primary" icon="Plus" @click="handleAdd" size="large">新增系统账号</el-button>
    </div>

    <el-table :data="userList" border stripe v-loading="loading" class="custom-table">
      <el-table-column prop="id" label="账号ID" width="80" align="center" />
      <el-table-column prop="username" label="登录账号" min-width="120" />
      <el-table-column prop="realName" label="真实姓名" min-width="120" />
      <el-table-column label="系统角色" width="150" align="center">
        <template #default="scope">
          <el-tag :type="getRoleTag(scope.row.roleType)">
            {{ getRoleName(scope.row.roleType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" min-width="120" />
      <el-table-column label="核心操作" width="280" fixed="right" align="center">
        <template #default="scope">
          <el-button type="warning" link icon="Refresh" @click="handleResetPwd(scope.row)">重置密码</el-button>
          <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          <!-- 超级管理员不建议直接删除 -->
          <el-button v-if="scope.row.roleType !== 0" type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 账号表单弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="登录账号" required>
          <el-input v-model="form.username" placeholder="请输入系统登录账号" :disabled="form.id !== null" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="如：张三主任" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="系统角色">
          <el-select v-model="form.roleType" placeholder="请分配系统角色">
            <el-option label="超级管理员" :value="0" />
            <el-option label="科研/项目方" :value="1" />
            <el-option label="教研/专家" :value="2" />
          </el-select>
        </el-form-item>
        <el-alert v-if="form.id == null" title="默认登录密码为: 123456" type="info" show-icon :closable="false" style="margin-top:15px;"/>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const userList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({ id: null, username: '', realName: '', roleType: 1, phone: '' })

// 辅助方法：角色显示
const getRoleName = (val) => ['超级管理员', '科研/项目方', '教研/专家'][val] || '普通用户'
const getRoleTag = (val) => ['danger', 'primary', 'success'][val] || 'info'

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-user/list', { params: { pageNo: 1, pageSize: 100 } })
    if (res.code === 200 && res.data) {
      userList.value = res.data.records || []
    }
  } finally {
    loading.value = false
  }
}

// 增改
const handleAdd = () => {
  dialogTitle.value = '新增系统账号'
  form.value = { id: null, username: '', realName: '', roleType: 1, phone: '' }
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = '编辑账号信息'
  form.value = { ...row }
  dialogVisible.value = true
}
const submitForm = async () => {
  const url = form.value.id ? '/sys-user/update' : '/sys-user/add'
  const res = await request[form.value.id ? 'put' : 'post'](url, form.value)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    getList()
  } else {
    ElMessage.error(res.msg || '保存失败')
  }
}

// 重置密码
const handleResetPwd = (row) => {
  ElMessageBox.confirm(`确定要将账号 [${row.username}] 的密码重置为 123456 吗？`, '系统警告', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await request.put(`/sys-user/reset-pwd/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('密码已成功重置为 123456')
    } else {
      ElMessage.error(res.msg || '重置失败')
    }
  }).catch(() => {})
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要永久删除账号 [${row.username}] 吗？此操作不可恢复。`, '危险操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const res = await request.delete(`/sys-user/delete/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('账号已删除')
      getList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>

<style scoped>
.app-container { padding: 20px; }
.header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.custom-table { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
</style>
