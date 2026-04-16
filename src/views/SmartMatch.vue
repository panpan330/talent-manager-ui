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
            <el-card v-for="(item, index) in matchResults" :key="index" shadow="hover" class="talent-card">
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
            <el-empty v-if="matchResults.length === 0" description="暂无符合条件的人才" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Aim, MagicStick } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
// 🔥 新增：引入请求工具和提示框
import request from '../utils/request'
import { ElMessage } from 'element-plus'

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

// 🔥 接收后端真实计算结果
const matchResults = ref([])

const getScoreColor = (percentage) => {
  if (percentage >= 90) return '#67C23A'
  if (percentage >= 80) return '#E6A23C'
  return '#F56C6C'
}

// 🔥 核心改造：调用后端真实算法接口
const startMatch = async () => {
  isMatching.value = true
  hasMatched.value = true
  
  try {
    // 把左侧滑块的 weights 参数原封不动地发给后端大厨
    const res = await request.post('/sys-talent-profile/smart-match', weights)
    
    if (res.code === 200) {
      // 成功拿到后端的余弦相似度排序结果！
      matchResults.value = res.data
      ElMessage.success('全息检索完成！')
    } else {
      ElMessage.error(res.msg || '检索失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('服务器连接异常，请检查后端是否启动')
  } finally {
    // 加载动画结束
    // 为了稍微有一点“系统正在疯狂计算”的视觉缓冲感，我们可以加个500毫秒延迟关闭loading
    setTimeout(() => {
      isMatching.value = false
    }, 500)
  }
}
</script>

<style scoped>
/* 样式部分完全保持不变 */
.match-container { padding: 10px; }
.control-panel, .result-panel { min-height: calc(100vh - 170px); border-radius: 8px; }
.panel-header { display: flex; align-items: center; font-size: 16px; }
.slider-group { margin-bottom: 40px; }
.slider-item { margin-bottom: 25px; }
.label-box { display: flex; justify-content: space-between; font-size: 14px; color: #606266; margin-bottom: 10px; font-weight: 500; }
.weight-val { color: #409EFF; font-weight: bold; }
.match-btn { width: 100%; border-radius: 8px; font-size: 16px; letter-spacing: 2px; }
.talent-card { margin-bottom: 15px; border-radius: 8px; }
.card-content { display: flex; align-items: center; }
.avatar-box { width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 20px; flex-shrink: 0; }
.rank-1 { background: linear-gradient(135deg, #F56C6C, #ff9e9e); box-shadow: 0 4px 10px rgba(245,108,108,0.3); }
.rank-2 { background: linear-gradient(135deg, #E6A23C, #f3d19e); box-shadow: 0 4px 10px rgba(230,162,60,0.3); }
.rank-3 { background: linear-gradient(135deg, #409EFF, #8cc5ff); box-shadow: 0 4px 10px rgba(64,158,255,0.3); }
.info-box { flex-grow: 1; }
.desc { margin: 5px 0; color: #606266; font-size: 14px; }
.score-box { display: flex; flex-direction: column; align-items: center; margin-left: 20px; }
.score-label { font-size: 12px; color: #909399; margin-bottom: 5px; }
</style>