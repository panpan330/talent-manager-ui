<template>
  <div class="app-container">
    <div class="header-box">
      <h2>🚀 项目与需求匹配中心</h2>
      <el-button type="primary" icon="Plus" @click="handleAdd" size="large">发布新项目</el-button>
    </div>

    <el-table :data="projectList" border stripe v-loading="loading" class="custom-table">
      <el-table-column prop="id" label="项目编号" width="90" align="center" />
      <el-table-column prop="projectName" label="项目名称" min-width="180" />
      <el-table-column prop="publisher" label="发布方" width="150" align="center" />
      <el-table-column label="所属领域" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getDomainTag(scope.row.domain)">
            {{ getDomainName(scope.row.domain) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预算(万元)" width="100" align="center">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.budget }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核心操作" width="280" fixed="right" align="center">
        <template #default="scope">
          <el-button type="warning" link icon="Setting" @click="handleConfigReq(scope.row)">配置需求</el-button>
          <el-button type="success" link icon="MagicStick" @click="handleSmartMatch(scope.row)">
            <b>一键撮合</b>
          </el-button>
          <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="项目名称">
          <el-input v-model="form.projectName" placeholder="如：基于脑机接口的智能轮椅" />
        </el-form-item>
        <el-form-item label="发布方">
          <el-input v-model="form.publisher" placeholder="如：协和医院康复科" />
        </el-form-item>
        <el-form-item label="所属领域">
          <el-select v-model="form.domain" placeholder="请选择">
            <el-option label="计算机科学" :value="0" />
            <el-option label="康复医学" :value="1" />
            <el-option label="深度交叉" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目预算">
          <el-input-number v-model="form.budget" :min="0" :step="10" /> <span style="margin-left: 10px;">万元</span>
        </el-form-item>
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
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

const loading = ref(false)
const projectList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({ id: null, projectName: '', publisher: '', domain: 2, budget: 0 })

// 获取项目列表
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/biz-project/list')
    if (res.code === 200) {
      projectList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

// 增改操作
const handleAdd = () => {
  dialogTitle.value = '发布新项目'
  form.value = { id: null, projectName: '', publisher: '', domain: 2, budget: 50 }
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = '修改项目信息'
  form.value = { ...row }
  dialogVisible.value = true
}
const submitForm = async () => {
  const res = await request.post('/biz-project/save', form.value)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getList()
  }
}

// 🔥 核心亮点：触发智能匹配算法
const handleSmartMatch = (row) => {
  ElMessageBox.confirm(
    `即将为项目【${row.projectName}】启动 AI 全息智能撮合，系统将在后台计算全库人才特征向量，是否继续？`,
    '启动智能撮合引擎',
    {
      confirmButtonText: '⚡ 开始计算',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  ).then(async () => {
    // 调用我们在后端写好的 2.0 算法接口！
    const res = await request.post(`/biz-project/smart-match/${row.id}`)
    if (res.code === 200) {
      ElNotification({
        title: '算法执行完毕',
        message: res.msg,
        type: 'success',
        duration: 5000
      })
    } else {
      ElMessage.error(res.msg || '撮合失败，请检查项目是否配置了需求')
    }
  }).catch(() => {})
}

// （预留：配置具体五维需求的逻辑，弹窗和提交到 requirement 表，你可以稍后完善）
const handleConfigReq = (row) => {
  ElMessage.info('这是通往配置五维雷达图的入口，咱们可以下一步补全它！')
}

// 辅助格式化
const getDomainName = (val) => ['计算机科学', '康复医学', '深度交叉'][val] || '未知'
const getDomainTag = (val) => ['', 'success', 'warning'][val] || 'info'

onMounted(() => { getList() })
</script>

<style scoped>
.app-container { padding: 20px; }
.header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.custom-table { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
</style>