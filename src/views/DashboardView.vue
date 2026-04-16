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
      <el-col :span="12">
        <el-card shadow="never" class="chart-box">
          <template #header>
            <span style="font-weight: bold;">人才去向分布 (待开发)</span>
          </template>
          <div class="empty-chart">
            <el-empty description="ECharts 饼图占位" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-box">
          <template #header>
            <span style="font-weight: bold;">三大领域核心能力均值对比 (待开发)</span>
          </template>
          <div class="empty-chart">
             <el-empty description="ECharts 柱状图/折线图占位" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { User, Monitor, FirstAidKit, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 加载状态，用于显示 Loading 动画
const loading = ref(true)

// 核心数据模型（初始值为 0，避免页面刚刷新时白屏闪烁）
const stats = ref({
  total: 0,
  csCount: 0,
  rehabCount: 0,
  crossCount: 0
})

// 🔥 向后端大厨（DashboardController）要真实数据的方法
const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const res = await request.get('/dashboard/stats')
    if (res.code === 200) {
      // 拿到真实数据，自动覆盖响应式变量，Vue 会自动把新数字渲染到网页上！
      stats.value = res.data
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

// 页面一挂载（打开），就立刻去拉取数据
onMounted(() => {
  fetchDashboardStats()
})
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