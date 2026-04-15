<template>
  <div class="talent-container">
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="人才姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入姓名" clearable @clear="loadData"></el-input>
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-select v-model="searchForm.primaryDomain" placeholder="全部领域" clearable style="width: 150px" @change="loadData">
            <el-option label="计算机科学" :value="0"></el-option>
            <el-option label="康复医学" :value="1"></el-option>
            <el-option label="深度交叉" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="action-btns">
        <el-button type="warning" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增人才档案</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="tableData" style="width: 100%" border stripe highlight-current-row>
      <el-table-column prop="id" label="ID" width="70" align="center" />
      <el-table-column prop="realName" label="姓名" width="100" />
      <el-table-column prop="primaryDomain" label="主攻领域" width="130" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.primaryDomain === 0" type="primary" effect="light">计算机科学</el-tag>
          <el-tag v-else-if="scope.row.primaryDomain === 1" type="success" effect="light">康复医学</el-tag>
          <el-tag v-else type="warning" effect="light">深度交叉</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="educationLevel" label="最高学历" width="100" align="center" />
      <el-table-column prop="researchDirection" label="主要研究方向" min-width="180" show-overflow-tooltip />
      <el-table-column prop="employmentStatus" label="就业状态" width="120" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.employmentStatus === 0" type="info">在校培养</el-tag>
          <el-tag v-else-if="scope.row.employmentStatus === 1" type="success">科研院所</el-tag>
          <el-tag v-else type="danger">企业就职</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="warning" link @click="showSkillRadar(scope.row)">技能画像</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-box">
      <el-pagination background layout="total, prev, pager, next" :total="tableData.length" />
    </div>

    <el-dialog
      v-model="radarVisible"
      :title="`【${currentTalentName}】的多维能力评估图`"
      width="600px"
      @closed="disposeChart"
    >
      <div id="skill-chart" style="width: 100%; height: 400px;"></div>
    </el-dialog>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="padding-right: 20px;">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入人才真实姓名" />
        </el-form-item>
        <el-form-item label="主攻领域" prop="primaryDomain">
          <el-select v-model="form.primaryDomain" placeholder="请选择主攻领域" style="width: 100%">
            <el-option label="计算机科学" :value="0"></el-option>
            <el-option label="康复医学" :value="1"></el-option>
            <el-option label="深度交叉" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最高学历" prop="educationLevel">
          <el-select v-model="form.educationLevel" placeholder="请选择学历" style="width: 100%">
            <el-option label="本科" value="本科"></el-option>
            <el-option label="硕士" value="硕士"></el-option>
            <el-option label="博士" value="博士"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="研究方向" prop="researchDirection">
          <el-input v-model="form.researchDirection" type="textarea" placeholder="如：脑机接口、康复机器人、运动数据分析" />
        </el-form-item>
        <el-form-item label="就业状态" prop="employmentStatus">
          <el-radio-group v-model="form.employmentStatus">
            <el-radio :value="0">在校培养</el-radio>
            <el-radio :value="1">科研院所</el-radio>
            <el-radio :value="2">企业就职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 认 保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 🔥 注意这里多引入了 Download 图标
import { Search, Plus, Download } from '@element-plus/icons-vue'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
import * as echarts from 'echarts'

// ==== 数据定义 ====
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增人才档案')
const formRef = ref(null)

const searchForm = reactive({ realName: '', primaryDomain: null })
const form = ref({ id: null, realName: '', primaryDomain: null, educationLevel: '', researchDirection: '', employmentStatus: 0 })
const rules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  primaryDomain: [{ required: true, message: '请选择主攻领域', trigger: 'change' }]
}

// ==== 雷达图专项数据 ====
const radarVisible = ref(false)
const currentTalentName = ref('')
let myChart = null

// ==== 方法逻辑 ====

// 1. 获取列表数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-talent-profile/list')
    if (res.code === 200) tableData.value = res.data
    else ElMessage.error(res.msg || '获取数据失败')
  } catch (error) {
    ElMessage.error('无法连接到后端服务器')
  } finally {
    loading.value = false
  }
}

// 2. 增删改查
const handleAdd = () => { dialogTitle.value = '新增人才档案'; form.value = { id: null, realName: '', primaryDomain: null, educationLevel: '', researchDirection: '', employmentStatus: 0 }; dialogVisible.value = true }
const handleEdit = (row) => { dialogTitle.value = '编辑人才档案'; form.value = JSON.parse(JSON.stringify(row)); dialogVisible.value = true }
const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request.post('/sys-talent-profile/save', form.value)
        if (res.code === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadData() } 
        else ElMessage.error(res.msg || '保存失败')
      } catch (error) { ElMessage.error('请求后端失败') }
    }
  })
}
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该人才档案吗？', '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    try {
      const res = await request.delete(`/sys-talent-profile/${id}`)
      if (res.code === 200) { ElMessage.success('删除成功'); loadData() }
    } catch (error) { ElMessage.error('删除操作失败') }
  })
}

// 🔥 3. 核心黑科技：导出 Excel
const handleExport = async () => {
  ElMessage.info('正在生成 Excel 文件，请稍候...')
  try {
    // 强制告诉 axios，我们要接收的是二进制文件流 (blob)
    const res = await request.get('/sys-talent-profile/export', { responseType: 'blob' })
    
    // 创造一个虚拟的“下载链接”
    const blob = new Blob([res])
    const downloadElement = document.createElement('a')
    const href = window.URL.createObjectURL(blob)
    
    // 触发点击下载
    downloadElement.href = href
    downloadElement.download = '交叉人才档案汇总.xlsx' // 设定的下载文件名
    document.body.appendChild(downloadElement)
    downloadElement.click()
    
    // 下载完清理垃圾，释放内存
    document.body.removeChild(downloadElement)
    window.URL.revokeObjectURL(href)
    ElMessage.success('Excel 导出成功！')
  } catch (error) {
    console.error(error)
    ElMessage.error('导出失败，请检查后端服务是否正常')
  }
}

// 4. 展示雷达图
const showSkillRadar = (row) => {
  currentTalentName.value = row.realName
  radarVisible.value = true
  nextTick(() => {
    if (myChart) myChart.dispose()
    const chartDom = document.getElementById('skill-chart')
    myChart = echarts.init(chartDom)
    let skillData = []
    let colorColor = ''
    if (row.primaryDomain === 0) {
      skillData = [95, 90, 85, 40, 50, 70]
      colorColor = '#409EFF'
    } else if (row.primaryDomain === 1) {
      skillData = [30, 40, 60, 95, 90, 50]
      colorColor = '#67C23A'
    } else {
      skillData = [88, 85, 80, 85, 82, 85]
      colorColor = '#E6A23C'
    }
    const option = {
      tooltip: { trigger: 'item' },
      radar: {
        indicator: [
          { name: '编程开发 (Dev)', max: 100 },
          { name: '算法设计 (Algo)', max: 100 },
          { name: '数据统计 (Stats)', max: 100 },
          { name: '临床评估 (Clinical)', max: 100 },
          { name: '生理基础 (Physio)', max: 100 },
          { name: '硬件交互 (Hardware)', max: 100 }
        ],
        splitNumber: 4,
        axisName: { color: '#333', fontWeight: 'bold' }
      },
      series: [
        {
          name: '能力画像',
          type: 'radar',
          data: [
            {
              value: skillData,
              name: row.realName,
              itemStyle: { color: colorColor },
              areaStyle: { color: colorColor, opacity: 0.3 }
            }
          ]
        }
      ]
    }
    myChart.setOption(option)
  })
}

// 弹窗关闭时销毁图表
const disposeChart = () => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.talent-container { padding: 10px; }
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; background-color: #fff; padding: 15px; border-radius: 8px; }
.search-form .el-form-item { margin-bottom: 0; }
.pagination-box { margin-top: 20px; display: flex; justify-content: flex-end; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
</style>