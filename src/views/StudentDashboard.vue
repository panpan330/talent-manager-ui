<template>
  <div class="student-dashboard">
    <el-row :gutter="20">
      <!-- 左侧：个人基本信息卡片 -->
      <el-col :span="8">
        <!-- 个人基本信息卡片 -->
        <el-card shadow="hover" class="profile-card" style="margin-bottom: 20px;">
          <div class="avatar-wrapper">
            <el-avatar :size="100" class="custom-avatar">{{ profileData.realName?.charAt(0) || 'U' }}</el-avatar>
          </div>
          <h2 class="profile-name">{{ profileData.realName || '加载中...' }}</h2>
          <div class="profile-tags">
            <el-tag :type="getDomainTag(profileData.primaryDomain)" effect="dark" round>
              {{ getDomainName(profileData.primaryDomain) }}
            </el-tag>
            <el-tag type="info" effect="plain" round>
              {{ getEmploymentName(profileData.employmentStatus) }}
            </el-tag>
          </div>
          <el-divider border-style="dashed" />
          <div class="info-list">
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ profileData.phone || '未填写' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Reading /></el-icon>
              <span>{{ profileData.educationLevel || '未填写' }}</span>
            </div>
            <div class="info-item direction-item">
              <el-icon><Position /></el-icon>
              <span class="direction-text" :title="profileData.researchDirection">{{ profileData.researchDirection || '暂无方向' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 全宽：物联网设备模拟器 (放在图表上方，确保显眼) -->
      <el-col :span="24">
        <el-card shadow="hover" class="simulator-card" style="background-color: #f0f9eb;">
          <template #header>
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span><b style="color: #67c23a; font-size: 16px;">🌐 康复设备采集模拟器 (硬件联调测试区)</b></span>
              <el-tag :type="isSimulating ? 'success' : 'info'" size="large" effect="dark">
                {{ isSimulating ? '🔴 实时数据采集中...' : '⚪ 设备已断开' }}
              </el-tag>
            </div>
          </template>
          <div class="simulator-controls" style="display: flex; align-items: center; gap: 20px;">
            <p style="font-size: 14px; color: #606266; margin: 0; flex: 1;">
              提示：点击右侧按钮，可真实模拟您佩戴的 IoT 康复设备（如智能手套）向系统高频发送训练产生的运动时空数据，并在下方图表中实时呈现。
            </p>
            <el-button :type="isSimulating ? 'danger' : 'success'" size="large" style="width: 200px; font-weight: bold;" @click="toggleSimulation">
              {{ isSimulating ? '⏹ 停止训练采集' : '▶ 开始佩戴训练' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 下方全宽：实时康复数据监控图表 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><b>📈 我的康复训练轨迹记录</b></span>
              <el-button type="primary" link @click="loadRehabData">刷新数据</el-button>
            </div>
          </template>
          <div id="rehabChart" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 下方左侧：我的项目 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><b>💼 我参与的项目</b></span>
            </div>
          </template>
          <div v-loading="projectLoading">
            <el-table :data="myProjects" stripe v-if="myProjects.length > 0">
              <el-table-column prop="projectName" label="项目名称" min-width="150" />
              <el-table-column prop="publisher" label="发布方" width="120" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 0 ? 'success' : (scope.row.status === 1 ? 'primary' : 'info')">
                    {{ scope.row.status === 0 ? '招募中' : (scope.row.status === 1 ? '进行中' : '已结题') }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="empty-skill">
              <el-empty description="暂未参与任何项目" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 下方右侧：智能培训推荐 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><b>📚 为您定制的智能培训推荐</b></span>
            </div>
          </template>
          <div v-loading="loading">
            <el-timeline v-if="recommendPlans.length > 0" class="custom-timeline">
              <el-timeline-item
                v-for="(plan, index) in recommendPlans"
                :key="index"
                :type="plan.difficultyLevel === 3 ? 'danger' : (plan.difficultyLevel === 2 ? 'warning' : 'primary')"
                :size="plan.difficultyLevel === 3 ? 'large' : 'normal'"
                :hollow="true"
              >
                <el-card shadow="hover" class="timeline-card">
                  <h4 class="plan-title">{{ plan.planName }}
                    <el-tag size="small" class="plan-tag" :type="getDomainTag(plan.targetDomain)">
                      {{ getDomainName(plan.targetDomain) }}
                    </el-tag>
                    <el-tag size="small" type="info" class="plan-tag">
                      难度: L{{ plan.difficultyLevel }}
                    </el-tag>
                  </h4>
                  <p class="plan-desc">{{ plan.contentDesc }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="empty-skill">
              <el-empty description="暂无适合的培训计划推荐" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Phone, Reading, Position } from '@element-plus/icons-vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const profileData = ref({})
const skillData = ref(null)
const recommendPlans = ref([])
const myProjects = ref([])
const loading = ref(false)
const projectLoading = ref(false)

// 模拟器状态
const isSimulating = ref(false)
let simulateTimer = null
let simStep = 0

const loadStudentData = async () => {
  const talentId = localStorage.getItem('talentId')
  if (!talentId) {
    ElMessage.warning('未能获取到您的档案信息，请联系管理员核实')
    return
  }
  
  loading.value = true
  projectLoading.value = true
  try {
    // 1. 获取基本档案信息
    const profileRes = await request.get('/sys-talent-profile/list')
    if (profileRes.code === 200 && profileRes.data) {
      const myProfile = profileRes.data.find(p => p.id == talentId)
      if (myProfile) {
        profileData.value = myProfile
      }
    }

    // 2. 获取技能画像
    const skillRes = await request.get(`/sys-talent-skill/talent/${talentId}`)
    if (skillRes.code === 200 && skillRes.data) {
      skillData.value = skillRes.data
      renderRadarChart(skillRes.data)
    }

    // 3. 获取培训推荐
    const recRes = await request.get(`/api/training/recommend/${talentId}`)
    if (recRes.code === 200) {
      recommendPlans.value = recRes.data || []
    }
    
    // 4. 获取我参与的项目
    const projectRes = await request.get('/biz-project/list', {
      params: { role: 'student', talentId: talentId }
    })
    if (projectRes.code === 200) {
      myProjects.value = projectRes.data || []
    }
    
    // 5. 加载真实康复数据
    loadRehabData()
  } catch (error) {
    console.error('加载学生数据失败:', error)
  } finally {
    loading.value = false
    projectLoading.value = false
  }
}

const loadRehabData = async () => {
  const talentId = localStorage.getItem('talentId')
  if (!talentId) return
  
  try {
    const res = await request.get(`/api/iot/motion-data/list/${talentId}`)
    if (res.code === 200 && res.data) {
      renderRehabLineChart(res.data)
    }
  } catch (error) {
    console.error('加载康复数据失败', error)
  }
}

const renderRehabLineChart = async (dataList) => {
  await nextTick()
  const chartDom = document.getElementById('rehabChart')
  if (!chartDom) return
  
  // 修复：如果该 dom 已经有 echarts 实例，就先 dispose 销毁它，再重新 init
  let myChart = echarts.getInstanceByDom(chartDom)
  if (myChart) {
    myChart.dispose()
  }
  myChart = echarts.init(chartDom)
  
  // 如果没有数据，显示提示
  if (dataList.length === 0) {
    myChart.clear()
    return
  }

  // 只取最新的 100 条展示
  const displayData = dataList.slice(-100)
  
  const xAxisData = displayData.map(item => {
    const date = new Date(item.recordTime)
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  })
  const angleXData = displayData.map(item => item.angleX)
  const angleYData = displayData.map(item => item.angleY)
  const forceData = displayData.map(item => item.forceValue)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['X轴角度', 'Y轴角度', '手指受力(N)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: xAxisData },
    yAxis: { type: 'value' },
    series: [
      { name: 'X轴角度', type: 'line', data: angleXData, smooth: true },
      { name: 'Y轴角度', type: 'line', data: angleYData, smooth: true },
      { name: '手指受力(N)', type: 'line', data: forceData, smooth: true, areaStyle: { opacity: 0.1 } }
    ]
  }
  myChart.setOption(option)
}

const renderRadarChart = async (skills) => {
  await nextTick()
  const chartDom = document.getElementById('radarChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {},
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
      axisName: { color: '#409EFF', fontSize: 14, fontWeight: 'bold' },
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
        name: '我的技能分值',
        areaStyle: { color: 'rgba(64, 158, 255, 0.4)' },
        lineStyle: { color: '#409EFF', width: 2 },
        itemStyle: { color: '#409EFF' }
      }]
    }]
  }
  myChart.setOption(option)
}

// 辅助工具函数
const getDomainName = (val) => ['计算机科学', '康复医学', '深度交叉'][val] || '未知'
const getDomainTag = (val) => ['', 'success', 'warning'][val] || 'info'
const getEmploymentName = (val) => ['在校培养', '科研院所', '企业就职'][val] || '未知'

// --- 康复设备模拟器逻辑 ---
const formatDate = (dateObj) => {
  const yyyy = dateObj.getFullYear()
  const MM = String(dateObj.getMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getDate()).padStart(2, '0')
  const HH = String(dateObj.getHours()).padStart(2, '0')
  const mm = String(dateObj.getMinutes()).padStart(2, '0')
  const ss = String(dateObj.getSeconds()).padStart(2, '0')
  const SSS = String(dateObj.getMilliseconds()).padStart(3, '0')
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}.${SSS}`
}

const toggleSimulation = () => {
  const talentId = localStorage.getItem('talentId')
  if (!talentId) {
    ElMessage.warning('未能获取档案ID，无法模拟')
    return
  }
  
  if (isSimulating.value) {
    // 停止模拟
    isSimulating.value = false
    clearInterval(simulateTimer)
    ElMessage.success('康复设备已断开连接，训练数据采集结束。')
  } else {
    // 开始模拟
    isSimulating.value = true
    simStep = 0
    ElMessage.success('已连接到智能康复设备，开始实时采集数据！')
    
    // 每秒发送一次批量数据 (包含10个采样点)
    simulateTimer = setInterval(async () => {
      const dataList = []
      const now = Date.now()
      for (let i = 0; i < 10; i++) {
        simStep++
        const t = simStep * 0.1
        dataList.push({
          talentId: parseInt(talentId),
          deviceId: 'IOT-GLOVE-STUDENT',
          motionType: '手指屈伸综合训练(实时)',
          angleX: parseFloat((50 + 30 * Math.sin(t)).toFixed(2)),
          angleY: parseFloat((50 + 30 * Math.cos(t)).toFixed(2)),
          angleZ: 0,
          forceValue: parseFloat((10 + simStep * 0.1).toFixed(2)),
          recordTime: formatDate(new Date(now - (10 - i) * 100)), // 模拟100ms采样率
          createTime: formatDate(new Date())
        })
      }
      
      try {
        await request.post('/api/iot/motion-data/upload', dataList)
        // 上传成功，不显示提示以免干扰，控制台可看
      } catch (err) {
        console.error('上传模拟数据失败', err)
      }
    }, 1000)
  }
}

import { onUnmounted } from 'vue'

onMounted(() => {
  loadStudentData()
})

onUnmounted(() => {
  if (simulateTimer) clearInterval(simulateTimer)
})
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
}

.profile-card {
  text-align: center;
  padding: 20px 0;
  height: 100%;
}

.avatar-wrapper {
  margin-bottom: 20px;
}

.custom-avatar {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #fff;
  font-size: 36px;
  font-weight: bold;
}

.profile-name {
  margin: 10px 0;
  font-size: 24px;
  color: #303133;
}

.profile-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.info-list {
  text-align: left;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
  font-size: 14px;
}

.info-item .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.direction-item {
  align-items: flex-start;
}

.direction-text {
  flex: 1;
  line-height: 1.5;
}

.radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.strong-points-box {
  margin-top: 20px;
  width: 100%;
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

.empty-skill {
  padding: 40px 0;
}

.timeline-card {
  border-radius: 8px;
}

.plan-title {
  margin: 0 0 10px 0;
  color: #303133;
  display: flex;
  align-items: center;
}

.plan-tag {
  margin-left: 10px;
}

.plan-desc {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}
</style>
