<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <h3>系统总计人才</h3>
          <h1 style="color: #409EFF">128 人</h1>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <h3>本月新增档案</h3>
          <h1 style="color: #67C23A">12 份</h1>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <h3>待评估人才</h3>
          <h1 style="color: #E6A23C">5 人</h1>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card shadow="never" style="margin-top: 20px;">
      <h2>交叉能力全局分析</h2>
      <p>这里以后可以放全系统的宏观统计图表（饼图、柱状图等）...</p>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-container { padding: 10px; }
.stat-card { text-align: center; border-radius: 8px; }
.stat-card h3 { color: #909399; font-size: 14px; font-weight: normal; margin-bottom: 10px; }
.stat-card h1 { margin: 0; font-size: 36px; }
</style>