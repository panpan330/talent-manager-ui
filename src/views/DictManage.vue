<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧字典类型列表 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>📚 字典类型管理</span>
              <el-button type="primary" icon="Plus" size="small" @click="handleAddType">新增字典类型</el-button>
            </div>
          </template>

          <el-form :inline="true" :model="typeQuery" class="demo-form-inline">
            <el-form-item label="字典名称">
              <el-input v-model="typeQuery.dictName" placeholder="模糊查询" clearable @keyup.enter="getTypeList" />
            </el-form-item>
            <el-form-item label="字典类型">
              <el-input v-model="typeQuery.dictType" placeholder="如 sys_degree" clearable @keyup.enter="getTypeList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getTypeList">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="typeList" border stripe v-loading="typeLoading" highlight-current-row @current-change="handleTypeRowClick">
            <el-table-column prop="dictId" label="字典编号" width="80" align="center" />
            <el-table-column prop="dictName" label="字典名称" min-width="150" />
            <el-table-column prop="dictType" label="字典类型" min-width="150" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
                  {{ scope.row.status === 0 ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
              <template #default="scope">
                <el-button type="primary" link icon="Edit" @click.stop="handleEditType(scope.row)">编辑</el-button>
                <el-button type="danger" link icon="Delete" @click.stop="handleDeleteType(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧字典数据列表 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>📖 字典数据配置 - <span style="color: #409eff;">{{ currentDictName || '请选择左侧类型' }}</span></span>
              <el-button type="success" icon="Plus" size="small" @click="handleAddData" :disabled="!currentDictType">新增字典数据</el-button>
            </div>
          </template>

          <div v-if="!currentDictType" class="empty-data">
            <el-empty description="点击左侧字典类型行，查看并配置其数据项" />
          </div>
          <div v-else>
            <el-table :data="dataList" border stripe v-loading="dataLoading">
              <el-table-column prop="dictSort" label="排序" width="80" align="center" />
              <el-table-column prop="dictLabel" label="数据标签" min-width="120">
                <template #default="scope">
                  <el-tag effect="plain" style="font-weight: bold;">{{ scope.row.dictLabel }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="dictValue" label="数据键值" min-width="120" />
              <el-table-column label="操作" width="160" align="center">
                <template #default="scope">
                  <el-button type="primary" link icon="Edit" @click="handleEditData(scope.row)">编辑</el-button>
                  <el-button type="danger" link icon="Delete" @click="handleDeleteData(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典类型表单弹窗 -->
    <el-dialog :title="typeDialogTitle" v-model="typeDialogVisible" width="500px">
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="字典名称" required>
          <el-input v-model="typeForm.dictName" placeholder="如：学历等级列表" />
        </el-form-item>
        <el-form-item label="字典类型" required>
          <el-input v-model="typeForm.dictType" placeholder="如：sys_degree (全局唯一)" :disabled="!!typeForm.dictId" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTypeForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 字典数据表单弹窗 -->
    <el-dialog :title="dataDialogTitle" v-model="dataDialogVisible" width="500px">
      <el-form :model="dataForm" label-width="100px">
        <el-form-item label="字典类型">
          <el-input v-model="dataForm.dictType" disabled />
        </el-form-item>
        <el-form-item label="数据标签" required>
          <el-input v-model="dataForm.dictLabel" placeholder="如：博士" />
        </el-form-item>
        <el-form-item label="数据键值" required>
          <el-input v-model="dataForm.dictValue" placeholder="如：doctor" />
        </el-form-item>
        <el-form-item label="显示排序">
          <el-input-number v-model="dataForm.dictSort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDataForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 字典类型逻辑 ---
const typeLoading = ref(false)
const typeList = ref([])
const typeQuery = reactive({ dictName: '', dictType: '' })
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('')
const typeForm = reactive({ dictId: null, dictName: '', dictType: '', status: 0 })

const getTypeList = async () => {
  typeLoading.value = true
  try {
    const res = await request.get('/sys-dict-type/list', { params: typeQuery })
    if (res.code === 200) {
      typeList.value = res.data
    }
  } finally {
    typeLoading.value = false
  }
}

const handleAddType = () => {
  typeDialogTitle.value = '新增字典类型'
  Object.assign(typeForm, { dictId: null, dictName: '', dictType: '', status: 0 })
  typeDialogVisible.value = true
}

const handleEditType = (row) => {
  typeDialogTitle.value = '编辑字典类型'
  Object.assign(typeForm, row)
  typeDialogVisible.value = true
}

const submitTypeForm = async () => {
  if (!typeForm.dictName || !typeForm.dictType) {
    return ElMessage.warning('请填写必填项')
  }
  const res = await request.post('/sys-dict-type/save', typeForm)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    typeDialogVisible.value = false
    getTypeList()
  } else {
    ElMessage.error(res.msg || '操作失败')
  }
}

const handleDeleteType = (row) => {
  ElMessageBox.confirm(`确认删除字典类型 [${row.dictName}] 吗？删除后可能影响系统功能！`, '警告', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const res = await request.delete(`/sys-dict-type/${row.dictId}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      if (currentDictType.value === row.dictType) {
        currentDictType.value = ''
        currentDictName.value = ''
        dataList.value = []
      }
      getTypeList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

// --- 字典数据逻辑 ---
const currentDictType = ref('')
const currentDictName = ref('')
const dataLoading = ref(false)
const dataList = ref([])
const dataDialogVisible = ref(false)
const dataDialogTitle = ref('')
const dataForm = reactive({ dictCode: null, dictSort: 0, dictLabel: '', dictValue: '', dictType: '' })

const handleTypeRowClick = (row) => {
  if (!row) return
  currentDictType.value = row.dictType
  currentDictName.value = row.dictName
  getDataList()
}

const getDataList = async () => {
  if (!currentDictType.value) return
  dataLoading.value = true
  try {
    const res = await request.get('/sys-dict-data/list', { params: { dictType: currentDictType.value } })
    if (res.code === 200) {
      dataList.value = res.data
    }
  } finally {
    dataLoading.value = false
  }
}

const handleAddData = () => {
  dataDialogTitle.value = `新增 [${currentDictName.value}] 数据`
  Object.assign(dataForm, { dictCode: null, dictSort: 0, dictLabel: '', dictValue: '', dictType: currentDictType.value })
  dataDialogVisible.value = true
}

const handleEditData = (row) => {
  dataDialogTitle.value = '编辑字典数据'
  Object.assign(dataForm, row)
  dataDialogVisible.value = true
}

const submitDataForm = async () => {
  if (!dataForm.dictLabel || !dataForm.dictValue) {
    return ElMessage.warning('请填写必填项')
  }
  const res = await request.post('/sys-dict-data/save', dataForm)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dataDialogVisible.value = false
    getDataList()
  } else {
    ElMessage.error(res.msg || '操作失败')
  }
}

const handleDeleteData = (row) => {
  ElMessageBox.confirm(`确认删除字典数据项 [${row.dictLabel}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await request.delete(`/sys-dict-data/${row.dictCode}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getDataList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  getTypeList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}
.empty-data {
  padding: 40px 0;
  text-align: center;
}
</style>
