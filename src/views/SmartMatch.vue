<template>
  <div class="match-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never" class="control-panel">
          <template #header>
            <div class="panel-header">
              <el-icon><Aim /></el-icon>
              <span style="margin-left: 8px; font-weight: bold;">项目需求特征画像</span>
            </div>
          </template>
          
          <div class="slider-group">
            <div class="slider-item">
              <div class="label-box">
                <span>编程开发 (Dev)</span>
                <span class="weight-val">{{ weights.dev }}%</span>
              </div>
              <el-slider v-model="weights.dev" :step="10" show-stops />
            </div>
            <div class="slider-item">
              <div class="label-box">
                <span>算法设计 (Algo)</span>
                <span class="weight-val">{{ weights.algo }}%</span>
              </div>
              <el-slider v-model="weights.algo" :step="10" show-stops />
            </div>
            <div class="slider-item">
              <div class="label-box">
                <span>临床评估 (Clinical)</span>
                <span class="weight-val">{{ weights.clinical }}%</span>
              </div>
              <el-slider v-model="weights.clinical" :step="10" show-stops />
            </div>
            <div class="slider-item">
              <div class="label-box">
                <span>生理基础 (Physio)</span>
                <span class="weight-val">{{ weights.physio }}%</span>
              </div>
              <el-slider v-model="weights.physio" :step="10" show-stops />
            </div>
            <div class="slider-item">
              <div class="label-box">
                <span>硬件交互 (Hardware)</span>
                <span class="weight-val">{{ weights.hardware }}%</span>
              </div>
              <el-slider v-model="weights.hardware" :step="10" show-stops />
            </div>
          </div>

          <el-button type="primary" size="large" class="match-btn" @click="startMatch" :loading="isMatching">
            <el-icon><MagicStick /></el-icon> 开始全息检索
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never" class="result-panel">
          <template #header>
            <div class="panel-header">
              <span style="font-weight: bold;">最佳交叉人才推荐 (Top 3)</span>
            </div>
          </template>
          
          <div v-if="!hasMatched" class="empty-state">
            <el-empty description="请在左侧调节项目所需的技能权重，并点击“开始全息检索”" />
          </div>

          <div v-else class="match-list" v-loading="isMatching">
            <el-card v-for="(item, index) in mockResults" :key="index" shadow="hover" class="talent-card">
              <div class="card-content">
                <div class="avatar-box" :class="'rank-' + (index + 1)">
                  Top {{ index + 1 }}
                </div>
                <div class="info-box">
                  <h3 style="margin: 0 0 10px 0;">
                    {{ item.name }} 
                    <el-tag size="small" :type="item.domain === '深度交叉' ? 'warning' : 'primary'" style="margin-left: 10px;">
                      {{ item.domain }}
                    </el-tag>
                  </h3>
                  <p class="desc"><strong>研究方向：</strong>{{ item.desc }}</p>
                  <p class="desc" style="color: #909399; font-size: 13px;">核心优势：{{ item.strongPoints }}</p>
                </div>
                <div class="score-box">
                  <div class="score-label">综合契合度</div>
                  <el-progress type="dashboard" :percentage="item.score" :color="getScoreColor(item.score)" :width="80" />
                </div>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Aim, MagicStick } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'

const isMatching = ref(false)
const hasMatched = ref(false)

// 拖动条绑定的权重数据
const weights = reactive({
  dev: 20,
  algo: 20,
  clinical: 20,
  physio: 20,
  hardware: 20
})

// 模拟的后端计算结果
const mockResults = ref([])

// 进度条颜色渐变规则
const getScoreColor = (percentage) => {
  if (percentage >= 90) return '#67C23A' // 极度匹配：绿色
  if (percentage >= 80) return '#E6A23C' // 良好匹配：橙色
  return '#F56C6C' // 一般匹配：红色
}

// 触发匹配动作
const startMatch = () => {
  isMatching.value = true
  hasMatched.value = true
  
  // 模拟请求后端的延迟感 (1.5秒后展示结果)
  setTimeout(() => {
    mockResults.value = [
      { name: '王研究员', domain: '深度交叉', desc: '基于肌电信号的智能康复辅具研发', strongPoints: '算法设计、硬件交互', score: 96 },
      { name: '潘航宇', domain: '计算机科学', desc: '康复医疗信息系统开发', strongPoints: '编程开发、数据统计', score: 85 },
      { name: '李医生', domain: '康复医学', desc: '脑卒中上肢运动解码', strongPoints: '临床评估、生理基础', score: 72 }
    ]
    isMatching.value = false
  }, 1500)
}
</script>

<style scoped>
.match-container { padding: 10px; }
.control-panel, .result-panel { min-height: calc(100vh - 170px); border-radius: 8px; }
.panel-header { display: flex; align-items: center; font-size: 16px; }

/* 拖动条区域样式 */
.slider-group { margin-bottom: 40px; }
.slider-item { margin-bottom: 25px; }
.label-box { display: flex; justify-content: space-between; font-size: 14px; color: #606266; margin-bottom: 10px; font-weight: 500; }
.weight-val { color: #409EFF; font-weight: bold; }
.match-btn { width: 100%; border-radius: 8px; font-size: 16px; letter-spacing: 2px; }

/* 结果列表卡片样式 */
.talent-card { margin-bottom: 15px; border-radius: 8px; }
.card-content { display: flex; align-items: center; }
.avatar-box { 
  width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; 
  color: white; font-weight: bold; margin-right: 20px; flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg, #F56C6C, #ff9e9e); box-shadow: 0 4px 10px rgba(245,108,108,0.3); }
.rank-2 { background: linear-gradient(135deg, #E6A23C, #f3d19e); box-shadow: 0 4px 10px rgba(230,162,60,0.3); }
.rank-3 { background: linear-gradient(135deg, #409EFF, #8cc5ff); box-shadow: 0 4px 10px rgba(64,158,255,0.3); }

.info-box { flex-grow: 1; }
.desc { margin: 5px 0; color: #606266; font-size: 14px; }
.score-box { display: flex; flex-direction: column; align-items: center; margin-left: 20px; }
.score-label { font-size: 12px; color: #909399; margin-bottom: 5px; }
</style>