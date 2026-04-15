<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card blue-card">
          <div class="stat-icon"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <h3>系统人才总数</h3>
            <h2>1,284 <span class="unit">人</span></h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card green-card">
          <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
          <div class="stat-info">
            <h3>计算机科学领域</h3>
            <h2>452 <span class="unit">人</span></h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card purple-card">
          <div class="stat-icon"><el-icon><FirstAidKit /></el-icon></div>
          <div class="stat-info">
            <h3>康复医学领域</h3>
            <h2>386 <span class="unit">人</span></h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card orange-card">
          <div class="stat-icon"><el-icon><Connection /></el-icon></div>
          <div class="stat-info">
            <h3>深度交叉领域</h3>
            <h2>446 <span class="unit">人</span></h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>人才去向分布</span>
            </div>
          </template>
          <div id="statusChart" class="chart-box"></div>
        </el-card>
      </el-col>
      
      <el-col :span="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>三大领域核心能力均值对比</span>
            </div>
          </template>
          <div id="domainChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { User, Cpu, FirstAidKit, Connection } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 图表实例
let statusChartInstance = null
let domainChartInstance = null

// 初始化饼图 (人才去向)
const initStatusChart = () => {
  const chartDom = document.getElementById('statusChart')
  statusChartInstance = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    color: ['#909399', '#67C23A', '#F56C6C'],
    series: [
      {
        name: '就业状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: [
          { value: 580, name: '在校培养' },
          { value: 420, name: '科研院所' },
          { value: 284, name: '企业就职' }
        ]
      }
    ]
  }
  statusChartInstance.setOption(option)
}

// 初始化柱状图 (领域能力对比)
const initDomainChart = () => {
  const chartDom = document.getElementById('domainChart')
  domainChartInstance = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['计算机科学', '康复医学', '深度交叉'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['编程开发', '算法设计', '临床评估', '生理学基础', '硬件交互']
    },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '计算机科学',
        type: 'bar',
        barWidth: 15,
        itemStyle: { color: '#409EFF', borderRadius: [5, 5, 0, 0] },
        data: [92, 88, 30, 45, 60]
      },
      {
        name: '康复医学',
        type: 'bar',
        barWidth: 15,
        itemStyle: { color: '#9C27B0', borderRadius: [5, 5, 0, 0] },
        data: [25, 35, 95, 90, 40]
      },
      {
        name: '深度交叉',
        type: 'bar',
        barWidth: 15,
        itemStyle: { color: '#E6A23C', borderRadius: [5, 5, 0, 0] },
        data: [85, 82, 80, 85, 88]
      }
    ]
  }
  domainChartInstance.setOption(option)
}

// 页面挂载时渲染图表，并在窗口缩放时自适应
onMounted(() => {
  nextTick(() => {
    initStatusChart()
    initDomainChart()
  })
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  if (statusChartInstance) statusChartInstance.resize()
  if (domainChartInstance) domainChartInstance.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (statusChartInstance) statusChartInstance.dispose()
  if (domainChartInstance) domainChartInstance.dispose()
})
</script>

<style scoped>
.dashboard-container { padding: 10px; }
.stat-row { margin-bottom: 20px; }
.stat-card { 
  display: flex; align-items: center; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}
:deep(.el-card__body) { display: flex; align-items: center; width: 100%; padding: 20px; }
.stat-icon {
  width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 30px; color: #fff; margin-right: 15px;
}
.stat-info h3 { margin: 0; font-size: 14px; color: #909399; font-weight: normal; }
.stat-info h2 { margin: 5px 0 0; font-size: 28px; color: #303133; }
.unit { font-size: 14px; color: #909399; font-weight: normal; }

/* 各种颜色的卡片图标背景 */
.blue-card .stat-icon { background: linear-gradient(135deg, #409EFF, #73b3fb); box-shadow: 0 4px 12px rgba(64,158,255,0.3); }
.green-card .stat-icon { background: linear-gradient(135deg, #67C23A, #95d475); box-shadow: 0 4px 12px rgba(103,194,58,0.3); }
.purple-card .stat-icon { background: linear-gradient(135deg, #9C27B0, #d06ae0); box-shadow: 0 4px 12px rgba(156,39,176,0.3); }
.orange-card .stat-icon { background: linear-gradient(135deg, #E6A23C, #f3d19e); box-shadow: 0 4px 12px rgba(230,162,60,0.3); }

/* 图表区域 */
.chart-card { border-radius: 12px; }
.card-header { font-weight: bold; color: #303133; }
.chart-box { height: 350px; width: 100%; }
</style>