<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card" v-loading="loading">
          <div class="card-content">
            <div class="icon-wrapper bg-blue">
              <el-icon><User /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">系统人才总数</div>
              <div class="data-value">
                <span class="num">{{ stats.total }}</span>
                <span class="unit">人</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card" v-loading="loading">
          <div class="card-content">
            <div class="icon-wrapper bg-green">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">计算机科学领域</div>
              <div class="data-value">
                <span class="num">{{ stats.csCount }}</span>
                <span class="unit">人</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card" v-loading="loading">
          <div class="card-content">
            <div class="icon-wrapper bg-purple">
              <el-icon><FirstAidKit /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">康复医学领域</div>
              <div class="data-value">
                <span class="num">{{ stats.rehabCount }}</span>
                <span class="unit">人</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card" v-loading="loading">
          <div class="card-content">
            <div class="icon-wrapper bg-orange">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">深度交叉领域</div>
              <div class="data-value">
                <span class="num">{{ stats.crossCount }}</span>
                <span class="unit">人</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-cards">
      <el-col :span="8">
        <el-card shadow="never" class="chart-box">
          <template #header>
            <span style="font-weight: bold;">人才去向分布</span>
          </template>
          <div ref="pieChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-box">
          <template #header>
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span><b>🌐 患者康复运动轨迹 3D 分析 (物联网)</b></span>
              <el-select v-model="selectedTalentId" size="small" style="width: 150px" @change="loadMotionData" placeholder="选择监测人才">
                <el-option v-for="item in talentOptions" :key="item.id" :label="item.realName" :value="item.id" />
              </el-select>
            </div>
          </template>
          <div ref="chart3DRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-box">
          <template #header>
            <span style="font-weight: bold;">三大领域核心能力均值对比</span>
          </template>
          <div ref="radarChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import request from '../utils/request'
import { User, Monitor, FirstAidKit, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import 'echarts-gl'

// 加载状态，用于显示 Loading 动画
const loading = ref(true)
const pieChartRef = ref(null)
const chart3DRef = ref(null)
const radarChartRef = ref(null)

const selectedTalentId = ref(1) // 默认选第一个人
const talentOptions = ref([])

// 核心数据模型（初始值为 0，避免页面刚刷新时白屏闪烁）
const stats = ref({
  total: 0,
  csCount: 0,
  rehabCount: 0,
  crossCount: 0,
  schoolCount: 0,
  researchCount: 0,
  enterpriseCount: 0,
  avgDev: 0,
  avgAlgo: 0,
  avgClinical: 0,
  avgPhysio: 0,
  avgHardware: 0
})

// 🔥 向后端大厨（DashboardController）要真实数据的方法
const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/dashboard/stats')
    if (res.code === 200) {
      // 拿到真实数据，自动覆盖响应式变量，Vue 会自动把新数字渲染到网页上！
      stats.value = res.data
      
      // 确保 Vue 已经把最新数据渲染到 DOM 上之后，再画图
      await nextTick()
      initPieChart()
      initRadarChart()
    } else {
      ElMessage.error(res.msg || '获取大盘数据失败')
    }
  } catch (error) {
    console.error('大盘数据接口异常', error)
    ElMessage.error('无法连接到服务器')
  } finally {
    // 无论成功还是失败，都把加载动画关掉
    loading.value = false
  }
}

// 🔥 向后端要 3D 康复设备数据的方法
const fetch3DData = async () => {
  if (!selectedTalentId.value) return
  
  try {
    // 调用我们在后端写好的接口，拉取设备传感器传回来的真实历史数据
    const res = await request.get(`/api/iot/motion-data/list/${selectedTalentId.value}`)
    if (res.code === 200 && res.data && res.data.length > 0) {
      // 把后端传回来的对象数组，映射成 ECharts 3D 需要的 [X, Y, Z] 格式数组
      const chartData = res.data.map(item => [
        item.angleX,      // X轴: 左右偏角
        item.angleY,      // Y轴: 上下偏角
        item.forceValue   // Z轴: 握力大小
      ])
      await nextTick()
      init3DChart(chartData)
    } else {
      await nextTick()
      init3DChart([]) // 没数据就画个空的
    }
  } catch (error) {
    console.error('获取3D数据失败', error)
  }
}

// 初始化全局图表与下拉框
const initDashboard = async () => {
  loading.value = true
  try {
    // 1. 先获取人才列表填充下拉框
    const profileRes = await request.get('/sys-talent-profile/list')
    if (profileRes.code === 200 && profileRes.data && profileRes.data.length > 0) {
      talentOptions.value = profileRes.data.map(p => ({ id: p.id, realName: p.realName }))
      selectedTalentId.value = talentOptions.value[0].id
    }
    
    // 2. 并行加载核心数据
    await Promise.all([
      fetchDashboardStats(),
      fetch3DData()
    ])
  } finally {
    loading.value = false
  }
}

const loadMotionData = () => {
  fetch3DData()
}

// 页面一挂载（打开），就立刻去拉取数据
onMounted(() => {
  initDashboard()
})

const initPieChart = () => {
  if (!pieChartRef.value) return
  const myChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '人才去向',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.value.schoolCount || 0, name: '在校培养', itemStyle: { color: '#409EFF' } },
          { value: stats.value.researchCount || 0, name: '科研院所', itemStyle: { color: '#67C23A' } },
          { value: stats.value.enterpriseCount || 0, name: '企业就职', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  }

  // 检查数据是否全是0，如果是，则给一个占位展示
  const total = (stats.value.schoolCount || 0) + (stats.value.researchCount || 0) + (stats.value.enterpriseCount || 0);
  if (total === 0) {
    option.series[0].data = [{ value: 1, name: '暂无数据', itemStyle: { color: '#e4e7ed' } }]
    option.tooltip.formatter = '暂无就业去向数据'
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

const init3DChart = (realData) => {
  if (!chart3DRef.value) return
  const myChart = echarts.init(chart3DRef.value)
  
  const option = {
    tooltip: {
      formatter: function (params) {
        return `X偏角: ${params.value[0].toFixed(2)}°<br/>Y偏角: ${params.value[1].toFixed(2)}°<br/>握力: ${params.value[2].toFixed(2)} N`
      }
    },
    visualMap: {
      show: false,
      dimension: 2,
      min: 0,
      max: 50,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    xAxis3D: { type: 'value', name: 'X轴' },
    yAxis3D: { type: 'value', name: 'Y轴' },
    zAxis3D: { type: 'value', name: 'Z轴(力)' },
    grid3D: {
      viewControl: {
        projection: 'perspective'
      }
    },
    series: [{
      type: 'scatter3D',
      data: realData, // 这里传入真实数据
      symbolSize: 8,
      itemStyle: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)'
      },
      emphasis: {
        itemStyle: {
          color: '#ccc'
        }
      }
    }]
  }

  if (!realData || realData.length === 0) {
    option.title = { text: '暂无设备回传数据', left: 'center', top: 'center', textStyle: { color: '#ccc' } }
    option.series[0].data = []
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  const myChart = echarts.init(radarChartRef.value)
  
  const option = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '软件开发', max: 100 },
        { name: '算法工程', max: 100 },
        { name: '临床康复', max: 100 },
        { name: '生理机制', max: 100 },
        { name: '硬件与传感', max: 100 }
      ],
      radius: '65%',
      axisName: {
        color: '#fff',
        backgroundColor: '#666',
        borderRadius: 3,
        padding: [3, 5]
      }
    },
    series: [
      {
        name: '能力均值',
        type: 'radar',
        data: [
          {
            value: [
              stats.value.avgDev,
              stats.value.avgAlgo,
              stats.value.avgClinical,
              stats.value.avgPhysio,
              stats.value.avgHardware
            ],
            name: '全站人才能力均值',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.4)'
            },
            lineStyle: {
              color: '#409EFF'
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
    ]
  }

  // 空数据保护
  const totalAvg = stats.value.avgDev + stats.value.avgAlgo + stats.value.avgClinical + stats.value.avgPhysio + stats.value.avgHardware
  if (totalAvg === 0) {
    option.title = { text: '暂无技能数据', left: 'center', top: 'center', textStyle: { color: '#ccc' } }
    option.series[0].data = []
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.stat-cards {
  margin-bottom: 20px;
}

.data-card {
  border-radius: 12px;
  border: none;
  background: #fff;
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: white;
  margin-right: 20px;
  flex-shrink: 0;
}

/* 4 种酷炫的图标背景色 */
.bg-blue { background: linear-gradient(135deg, #409EFF, #8cc5ff); box-shadow: 0 4px 10px rgba(64,158,255,0.3); }
.bg-green { background: linear-gradient(135deg, #67C23A, #a0cfff); box-shadow: 0 4px 10px rgba(103,194,58,0.3); }
.bg-purple { background: linear-gradient(135deg, #b37feb, #d3adf7); box-shadow: 0 4px 10px rgba(179,127,235,0.3); }
.bg-orange { background: linear-gradient(135deg, #E6A23C, #f3d19e); box-shadow: 0 4px 10px rgba(230,162,60,0.3); }

.data-info {
  display: flex;
  flex-direction: column;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.data-value {
  display: flex;
  align-items: baseline;
}

.num {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-right: 5px;
}

.unit {
  font-size: 13px;
  color: #909399;
}

.chart-box {
  min-height: 400px;
  border-radius: 8px;
}

.empty-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>