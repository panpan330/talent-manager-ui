<template>
  <div class="app-container">
    <div class="header-box">
      <h2>🚀 项目与需求匹配中心</h2>
      <el-button type="primary" icon="Plus" @click="handleAdd" size="large">发布新项目</el-button>
    </div>

    <el-table :data="projectList" border stripe v-loading="loading" class="custom-table">
      <el-table-column prop="id" label="项目编号" width="90" align="center" />
      <el-table-column label="项目名称" min-width="180">
        <template #default="scope">
          <el-link type="primary" :underline="'never'" @click="handleViewProjectDetail(scope.row)">
            <b>{{ scope.row.projectName }}</b>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="publisher" label="发布方" width="150" align="center" />
      <el-table-column label="所属领域" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getDomainTag(scope.row.domain)">
            {{ getDomainName(scope.row.domain) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" width="120" align="center">
        <template #default="scope">
          <el-select v-model="scope.row.status" @change="(val) => handleStatusChange(scope.row.id, val)" size="small" style="width: 90px">
            <el-option label="招募中" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结题" :value="2" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="预算(万元)" width="100" align="center">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.budget }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核心操作" width="400" fixed="right" align="center">
        <template #default="scope">
          <el-button type="success" link icon="MagicStick" @click="handleSmartMatch(scope.row)">
            <b>一键撮合</b>
          </el-button>
          <el-button type="primary" link icon="User" @click="handleViewTalents(scope.row)">推荐与候选</el-button>
          <el-button type="warning" link icon="Setting" @click="handleConfigReq(scope.row)">配置需求</el-button>
          <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="项目名称">
          <el-input v-model="form.projectName" placeholder="如：基于脑机接口的智能轮椅" />
        </el-form-item>
        <el-form-item label="归属项目方" v-if="isAdmin">
          <el-select v-model="form.userId" placeholder="请选择归属科研/项目方" style="width: 100%">
            <el-option v-for="item in projectManagers" :key="item.id" :label="item.realName || item.username" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布方">
          <el-input v-model="form.publisher" placeholder="如：协和医院康复科" />
        </el-form-item>
        <el-form-item label="所属领域">
          <el-select v-model="form.domain" placeholder="请选择">
            <el-option v-for="item in domainDictList" :key="item.dictValue" :label="item.dictLabel" :value="parseInt(item.dictValue)" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" v-if="form.id">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">招募中</el-radio>
            <el-radio :value="1">进行中</el-radio>
            <el-radio :value="2">已结题</el-radio>
          </el-radio-group>
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

    <el-dialog :title="reqDialogTitle" v-model="reqDialogVisible" width="600px" destroy-on-close>
      <div style="margin-bottom: 20px; color: #606266; font-size: 14px; line-height: 1.6; background: #f0f9eb; padding: 10px; border-left: 4px solid #67c23a; border-radius: 4px;">
        💡 <b>AI撮合引擎硬性门槛：</b>请滑动配置该项目对交叉人才的五维能力<b>最低分数要求</b>。在全库检索时，低于此门槛的人才将被直接淘汰，不参与余弦相似度推荐。
      </div>
      <el-form :model="reqForm" label-width="140px" v-loading="reqLoading">
        <el-form-item label="编程开发 (Dev) >=">
          <el-slider v-model="reqForm.devReq" :max="100" show-input />
        </el-form-item>
        <el-form-item label="算法设计 (Algo) >=">
          <el-slider v-model="reqForm.algoReq" :max="100" show-input />
        </el-form-item>
        <el-form-item label="临床评估 (Clinical) >=">
          <el-slider v-model="reqForm.clinicalReq" :max="100" show-input />
        </el-form-item>
        <el-form-item label="生理基础 (Physio) >=">
          <el-slider v-model="reqForm.physioReq" :max="100" show-input />
        </el-form-item>
        <el-form-item label="硬件交互 (Hardware) >=">
          <el-slider v-model="reqForm.hardwareReq" :max="100" show-input />
        </el-form-item>
        <el-form-item label="补充文字说明">
          <el-input v-model="reqForm.description" type="textarea" :rows="3" placeholder="例如：必须熟练掌握 Python 和 C++，有脑机接口硬件调试经验者优先" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reqDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReqForm">保存配置并应用</el-button>
      </template>
    </el-dialog>


    <!-- 推荐人才与候选列表弹窗 -->
    <el-dialog :title="talentDialogTitle" v-model="talentDialogVisible" width="850px" destroy-on-close>
      <div style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
        <el-button type="success" icon="Download" @click="handleExportReport">导出项目撮合报告(Excel)</el-button>
      </div>
      <el-table :data="talentList" border stripe v-loading="talentLoading">
        <el-table-column type="index" label="排名" width="60" align="center" />
        <el-table-column prop="talentName" label="候选人姓名" min-width="120" />
        <el-table-column label="AI 匹配度" width="120" align="center">
          <template #default="scope">
            <el-progress type="circle" :percentage="scope.row.matchScore" :width="50" :color="customColors" />
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="info">待邀请</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="warning">已发邀请</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">已拒绝</el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="success">已合作</el-tag>
            <el-tag v-else-if="scope.row.status === 4" type="info" effect="plain">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0" type="primary" size="small" @click="handleSendInvite(scope.row.id)">发送邀请</el-button>
            <el-button v-else-if="scope.row.status === 3" type="danger" size="small" plain @click="handleCancelCooperation(scope.row.id)">取消合作</el-button>
            <span v-else style="color: #909399; font-size: 13px;">暂无可用操作</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 项目详细信息只读大屏弹窗 -->
    <el-dialog :title="detailTitle" v-model="detailVisible" width="650px" destroy-on-close custom-class="detail-dialog">
      <div v-loading="detailLoading" class="detail-container">
        <el-descriptions title="📋 基础信息" :column="2" border size="large">
          <el-descriptions-item label="发布单位/人" label-align="center" align="center">
            <b>{{ detailData.publisher || '未填写' }}</b>
          </el-descriptions-item>
          <el-descriptions-item label="所属领域" label-align="center" align="center">
            <el-tag :type="getDomainTag(detailData.domain)">{{ getDomainName(detailData.domain) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目预算" label-align="center" align="center">
            <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">￥{{ detailData.budget }} 万元</span>
          </el-descriptions-item>
          <el-descriptions-item label="项目状态" label-align="center" align="center">
            <el-tag :type="detailData.status === 0 ? 'success' : (detailData.status === 1 ? 'primary' : 'info')">
              {{ detailData.status === 0 ? '招募中' : (detailData.status === 1 ? '进行中' : '已结题') }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider border-style="dashed" />

        <div class="req-section" v-if="detailReqData">
          <h3 style="margin-bottom: 15px; color: #303133;">🎯 AI 能力画像要求</h3>
          <div class="progress-item">
            <span class="label">编程开发 (Dev)</span>
            <el-progress :percentage="detailReqData.devReq" :color="customColors" />
          </div>
          <div class="progress-item">
            <span class="label">算法设计 (Algo)</span>
            <el-progress :percentage="detailReqData.algoReq" :color="customColors" />
          </div>
          <div class="progress-item">
            <span class="label">临床评估 (Clinical)</span>
            <el-progress :percentage="detailReqData.clinicalReq" :color="customColors" />
          </div>
          <div class="progress-item">
            <span class="label">生理基础 (Physio)</span>
            <el-progress :percentage="detailReqData.physioReq" :color="customColors" />
          </div>
          <div class="progress-item">
            <span class="label">硬件交互 (Hardware)</span>
            <el-progress :percentage="detailReqData.hardwareReq" :color="customColors" />
          </div>
          <div class="req-desc-box" v-if="detailReqData.description">
            <div class="box-title">📝 详细描述</div>
            <p>{{ detailReqData.description }}</p>
          </div>
        </div>
        <div v-else class="empty-req">
          <el-empty description="项目方尚未配置该项目的能力画像要求" :image-size="80" />
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { 
  DataAnalysis, Odometer, User, Cpu, 
  Management, Bell, ArrowDown, SwitchButton, Avatar, Setting, Document, Plus, Download
} from '@element-plus/icons-vue'

const loading = ref(false)
const projectList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({ id: null, projectName: '', publisher: '', domain: 2, budget: 0, userId: null })

const isAdmin = ref(localStorage.getItem('role') === 'admin')
const projectManagers = ref([])

// --- 动态数据字典逻辑 ---
const domainDictList = ref([])

// 获取领域字典
const getDomainDict = async () => {
  try {
    const res = await request.get('/sys-dict-data/list?dictType=sys_domain')
    if (res.code === 200) {
      domainDictList.value = res.data
    }
  } catch (e) {
    console.error('获取领域字典失败', e)
  }
}

// --- 需求门槛配置逻辑 ---
const reqDialogVisible = ref(false)
const reqDialogTitle = ref('')
const reqLoading = ref(false)
const reqForm = reactive({
  id: null,
  projectId: null,
  devReq: 0,
  algoReq: 0,
  clinicalReq: 0,
  physioReq: 0,
  hardwareReq: 0,
  description: ''
})

const handleConfigReq = async (row) => {
  reqDialogTitle.value = `设置项目门槛 - [${row.projectName}]`
  reqForm.projectId = row.id
  reqForm.id = null
  reqForm.devReq = 0
  reqForm.algoReq = 0
  reqForm.clinicalReq = 0
  reqForm.physioReq = 0
  reqForm.hardwareReq = 0
  reqForm.description = ''
  
  reqDialogVisible.value = true
  reqLoading.value = true
  
  try {
    const res = await request.get(`/biz-project-requirement/${row.id}`)
    if (res.code === 200 && res.data) {
      Object.assign(reqForm, res.data)
    }
  } catch (error) {
    console.error('获取项目需求失败:', error)
  } finally {
    reqLoading.value = false
  }
}

const submitReqForm = async () => {
  try {
    const res = await request.post('/biz-project-requirement/save', reqForm)
    if (res.code === 200) {
      ElMessage.success('硬性门槛设置成功！')
      reqDialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '设置失败')
    }
  } catch (error) {
    console.error('保存项目需求失败:', error)
    ElMessage.error('服务器异常')
  }
}

// 人才候选列表相关状态
const talentDialogVisible = ref(false)
const talentDialogTitle = ref('')
const talentList = ref([])
const talentLoading = ref(false)
const currentProjectId = ref(null)

// 项目详情弹窗状态
const detailVisible = ref(false)
const detailTitle = ref('')
const detailData = ref({})
const detailReqData = ref(null)
const detailLoading = ref(false)

const customColors = [
  { color: '#f56c6c', percentage: 40 },
  { color: '#e6a23c', percentage: 60 },
  { color: '#5cb87a', percentage: 80 },
  { color: '#1989fa', percentage: 100 },
]

// 获取项目列表
const getList = async () => {
  loading.value = true
  try {
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')
    const res = await request.get('/biz-project/list', {
      params: { role, userId }
    })
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
  form.value = { id: null, projectName: '', publisher: '', domain: 2, budget: 50, userId: null, status: 0 }
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = '修改项目信息'
  form.value = { ...row }
  dialogVisible.value = true
}
const handleStatusChange = async (id, status) => {
  try {
    const res = await request.post(`/biz-project/update-status/${id}?status=${status}`)
    if (res.code === 200) {
      ElMessage.success('项目状态已更新')
    } else {
      ElMessage.error(res.msg || '状态更新失败')
      getList() // 失败时回滚列表显示
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
    getList() // 失败时回滚列表显示
  }
}
const submitForm = async () => {
  const payload = { ...form.value }
  // 新增项目时绑定当前登录用户的ID (如果不是管理员，或者管理员未选择归属)
  if (!payload.userId) {
    payload.userId = localStorage.getItem('userId')
  }
  
  const res = await request.post('/biz-project/save', payload)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getList()
  } else {
    ElMessage.error(res.msg || '保存失败')
  }
}

// 删除项目
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除项目 [${row.projectName}] 吗？删除后相关配置也会失效。`, '危险操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await request.delete(`/biz-project/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('服务器异常')
    }
  }).catch(() => {})
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

// 导出报告
const handleExportReport = async () => {
  if (!currentProjectId.value) return
  ElMessage.info('正在生成报告，请稍候...')
  try {
    const res = await request.get(`/biz-match-record/export/${currentProjectId.value}`, {
      responseType: 'blob'
    })
    
    // 使用返回的 Blob 数据创建临时下载链接
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 获取一个干净的项目名称作为文件名
    const cleanProjectName = talentDialogTitle.value.replace(/项目 \[|\] - AI 推荐候选人名单/g, '').trim() || '项目'
    link.setAttribute('download', `${cleanProjectName}_撮合推荐报告.xlsx`)
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理 DOM 和内存
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('🎉 报表导出成功！')
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出失败，请检查网络或联系管理员')
  }
}

// 辅助格式化
const getDomainName = (val) => {
  const item = domainDictList.value.find(d => parseInt(d.dictValue) === val)
  return item ? item.dictLabel : (['计算机科学', '康复医学', '深度交叉'][val] || '未知')
}
const getDomainTag = (val) => ['', 'success', 'warning'][val] || 'info'

// 查看项目详情大屏
const handleViewProjectDetail = async (row) => {
  detailTitle.value = `项目档案 - ${row.projectName}`
  detailData.value = { ...row }
  detailReqData.value = null
  detailVisible.value = true
  detailLoading.value = true
  
  try {
    const res = await request.get(`/biz-project-requirement/${row.id}`)
    if (res.code === 200 && res.data) {
      detailReqData.value = res.data
    }
  } catch (error) {
    console.error('获取项目需求失败', error)
  } finally {
    detailLoading.value = false
  }
}

// --- 推荐人才与邀请逻辑 ---
const handleViewTalents = async (row) => {
  talentDialogTitle.value = `项目 [${row.projectName}] - AI 推荐候选人名单`
  talentDialogVisible.value = true
  talentLoading.value = true
  currentProjectId.value = row.id
  
  try {
    const res = await request.get(`/biz-match-record/list/${row.id}`)
    if (res.code === 200) {
      talentList.value = res.data || []
    }
  } catch (error) {
    console.error('获取候选人列表失败', error)
  } finally {
    talentLoading.value = false
  }
}

const handleSendInvite = async (recordId) => {
  try {
    const res = await request.post(`/biz-match-record/send-invite/${recordId}`)
    if (res.code === 200) {
      ElMessage.success('邀请发送成功！')
      // 刷新列表
      const listRes = await request.get(`/biz-match-record/list/${currentProjectId.value}`)
      if (listRes.code === 200) {
        talentList.value = listRes.data || []
      }
    } else {
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  }
}

const handleCancelCooperation = async (recordId) => {
  try {
    await ElMessageBox.confirm('确定要取消与该人才的合作吗？此操作将立即发送系统通知告知该人才。', '取消合作', {
      confirmButtonText: '确定取消',
      cancelButtonText: '暂不取消',
      type: 'warning'
    })
    
    const res = await request.post(`/biz-match-record/cancel-cooperation/${recordId}`)
    if (res.code === 200) {
      ElMessage.success('已成功取消合作')
      // 刷新列表
      const listRes = await request.get(`/biz-match-record/list/${currentProjectId.value}`)
      if (listRes.code === 200) {
        talentList.value = listRes.data || []
      }
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('网络请求失败')
    }
  }
}

const getProjectManagers = async () => {
  if (isAdmin.value) {
    try {
      const res = await request.get('/sys-user/listByRole', { params: { roleType: 1 } })
      if (res.code === 200) {
        projectManagers.value = res.data
      }
    } catch (error) {
      console.error('获取项目方列表失败', error)
    }
  }
}

onMounted(() => { 
  getDomainDict()
  getList()
  getProjectManagers()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.custom-table { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* 项目详情弹窗样式 */
.detail-container { padding: 10px 20px; }
.req-section { margin-top: 10px; }
.progress-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.progress-item .label {
  width: 140px;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}
.progress-item .el-progress {
  flex: 1;
}
.req-desc-box {
  margin-top: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}
.box-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}
.empty-req {
  padding: 30px 0;
}
</style>