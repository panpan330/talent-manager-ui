<template>
  <div class="talent-container">
    <el-card shadow="never" class="search-box">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="人才姓名">
          <el-input v-model="queryParams.realName" placeholder="输入姓名搜索" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-select v-model="queryParams.primaryDomain" placeholder="全部" clearable style="width: 150px">
            <el-option label="计算机科学" :value="0" />
            <el-option label="康复医学" :value="1" />
            <el-option label="深度交叉" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增人才</el-button>
      <el-button type="success" icon="Download" @click="handleExport">导出数据 (EasyExcel)</el-button>
    </div>

    <el-table :data="talentList" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="realName" label="姓名" width="120" align="center" />
      <el-table-column label="主攻领域" width="150" align="center">
        <template #default="scope">
          <el-tag :type="getDomainTag(scope.row.primaryDomain)">
            {{ getDomainName(scope.row.primaryDomain) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="researchDirection" label="研究方向" min-width="200" show-overflow-tooltip />
      <el-table-column prop="phone" label="联系电话" width="150" align="center" />
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="small" type="warning" link icon="PieChart" @click="handleShowRadar(scope.row)">技能画像</el-button>
          <el-button size="small" type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-radio-group v-model="form.primaryDomain">
            <el-radio :label="0">计算机科学</el-radio>
            <el-radio :label="1">康复医学</el-radio>
            <el-radio :label="2">深度交叉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="研究方向">
          <el-input v-model="form.researchDirection" type="textarea" placeholder="简述其科研方向" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="radarTitle" v-model="radarVisible" width="600px" center destroy-on-close>
      <div id="radarChart" style="width: 100%; height: 400px;"></div>
      <template #footer>
        <div style="font-size: 12px; color: #909399;">数据来源：实时数据库 AHP 权重记录</div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Refresh, Plus, Download, Edit, PieChart, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// --- 数据定义 ---
const loading = ref(false)
const talentList = ref([])
const queryParams = reactive({
  realName: '',
  primaryDomain: null
})

// 表单弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  id: null,
  realName: '',
  primaryDomain: 0,
  phone: '',
  researchDirection: ''
})

// 雷达图弹窗控制
const radarVisible = ref(false)
const radarTitle = ref('')

// --- 核心方法 ---

// 1. 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-talent-profile/list')
    if (res.code === 200) {
      talentList.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 2. 搜索与重置
const handleQuery = () => {
  // 此处可根据 queryParams 进行前端过滤或向后端发分页带条件请求
  getList()
}
const resetQuery = () => {
  queryParams.realName = ''
  queryParams.primaryDomain = null
  getList()
}

// 3. 新增/修改操作
const handleAdd = () => {
  dialogTitle.value = '录入人才档案'
  Object.assign(form, { id: null, realName: '', primaryDomain: 0, phone: '', researchDirection: '' })
  dialogVisible.value = true
}
const handleUpdate = (row) => {
  dialogTitle.value = '修改人才信息'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单（调用后端规范化后的 saveOrUpdate）
const submitForm = async () => {
  const res = await request.post('/sys-talent-profile/save', form)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getList()
  }
}

// 4. 删除操作（带二次确认，体现企业级严谨）
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要永久删除人才 [${row.realName}] 的档案吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await request.delete(`/sys-talent-profile/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  })
}

// 5. 导出 Excel（直接调用后端 EasyExcel 接口）
const handleExport = () => {
  window.open('http://localhost:8080/sys-talent-profile/export', '_blank')
}

// 🔥 6. 核心：加载真实雷达图数据
const handleShowRadar = async (row) => {
  radarTitle.value = `[${row.realName}] 核心技能画像`
  radarVisible.value = true
  
  try {
    // 调用后端规范化的技能查询接口
    const res = await request.get(`/sys-talent-skill/talent/${row.id}`)
    if (res.code === 200 && res.data) {
      const skills = res.data
      
      // 必须在 nextTick 中初始化，确保 DOM 容器已加载
      await nextTick()
      const chartDom = document.getElementById('radarChart')
      const myChart = echarts.init(chartDom)
      
      const option = {
        radar: {
          indicator: [
            { name: '编程开发', max: 100 },
            { name: '算法设计', max: 100 },
            { name: '临床评估', max: 100 },
            { name: '生理基础', max: 100 },
            { name: '硬件交互', max: 100 }
          ],
          shape: 'circle',
          splitNumber: 5,
          axisName: { color: '#409EFF' },
          splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.2)' } },
          splitArea: { areaStyle: { color: ['#f5f7fa', '#fff'] } }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [
              skills.devScore, 
              skills.algoScore, 
              skills.clinicalScore, 
              skills.physioScore, 
              skills.hardwareScore
            ],
            name: '技能分值',
            areaStyle: { color: 'rgba(64, 158, 255, 0.4)' },
            lineStyle: { color: '#409EFF', width: 2 },
            itemStyle: { color: '#409EFF' }
          }]
        }]
      }
      myChart.setOption(option)
    } else {
      ElMessage.warning('该人员尚未录入详细技能分值')
    }
  } catch (error) {
    console.error(error)
  }
}

// --- 辅助工具函数 ---
const getDomainName = (val) => {
  return ['计算机科学', '康复医学', '深度交叉'][val] || '未知'
}
const getDomainTag = (val) => {
  return ['', 'success', 'warning'][val] || 'info'
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.talent-container { padding: 20px; }
.search-box { margin-bottom: 20px; border-radius: 8px; }
.action-bar { margin-bottom: 20px; display: flex; gap: 10px; }
.el-table { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
:deep(.el-table__header) { background-color: #f5f7fa !important; }
</style>