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
            <el-card v-for="(item, index) in matchResults" :key="index" shadow="hover" class="talent-card" @click="handleViewDetail(item)" style="cursor: pointer;">
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

    <!-- 个人详细信息弹窗 (直接复用人才档案中的样式设计) -->
    <el-dialog :title="detailTitle" v-model="detailVisible" width="750px" destroy-on-close custom-class="custom-detail-dialog">
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <!-- 左侧：个人基本档案卡片 -->
          <el-col :span="9">
            <el-card shadow="never" class="profile-card">
              <div class="avatar-wrapper">
                <el-avatar :size="80" class="custom-avatar">{{ (detailData.realName || detailData.name || '空').charAt(0) }}</el-avatar>
              </div>
              <h3 class="profile-name">{{ detailData.realName || detailData.name }}</h3>
              <div class="profile-tags">
                <el-tag :type="getDomainTag(detailData.primaryDomain !== undefined ? detailData.primaryDomain : (detailData.domain === '深度交叉' ? 2 : (detailData.domain === '康复医学' ? 1 : 0)))" effect="dark" round>
                  {{ getDomainName(detailData.primaryDomain !== undefined ? detailData.primaryDomain : (detailData.domain === '深度交叉' ? 2 : (detailData.domain === '康复医学' ? 1 : 0))) }}
                </el-tag>
                <el-tag type="info" effect="plain" round v-if="detailData.employmentStatus !== undefined">
                  {{ getEmploymentName(detailData.employmentStatus) }}
                </el-tag>
              </div>
              <el-divider border-style="dashed" />
              <div class="info-list">
                <div class="info-item">
                  <el-icon><Phone /></el-icon>
                  <span>{{ detailData.phone || '未填写' }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Reading /></el-icon>
                  <span>{{ detailData.educationLevel || '未填写' }}</span>
                </div>
                <div class="info-item direction-item">
                  <el-icon><Position /></el-icon>
                  <span class="direction-text" :title="detailData.researchDirection || detailData.desc">{{ detailData.researchDirection || detailData.desc || '暂无方向' }}</span>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：技能分析与培训推荐 -->
          <el-col :span="15">
            <el-card shadow="never" class="skill-card">
              <el-tabs v-model="activeDetailTab" class="detail-tabs">
                <!-- Tab 1: 能力评估 -->
                <el-tab-pane label="综合能力评估" name="skills">
                  <div v-if="detailSkill" class="skill-details">
                    <div class="skill-progress">
                      <div class="progress-item">
                        <span class="label">编程开发 (Dev)</span>
                        <el-progress :percentage="detailSkill.devScore || 0" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">算法设计 (Algo)</span>
                        <el-progress :percentage="detailSkill.algoScore || 0" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">临床评估 (Clinical)</span>
                        <el-progress :percentage="detailSkill.clinicalScore || 0" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">生理基础 (Physio)</span>
                        <el-progress :percentage="detailSkill.physioScore || 0" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">硬件交互 (Hardware)</span>
                        <el-progress :percentage="detailSkill.hardwareScore || 0" :color="customColors" :stroke-width="10" />
                      </div>
                    </div>
                    
                    <div class="strong-points-box">
                      <div class="box-title">🌟 核心优势分析</div>
                      <p>{{ detailSkill.strongPoints || '系统正在跟踪分析中...' }}</p>
                    </div>
                  </div>
                  <div v-else class="empty-skill">
                    <el-empty description="尚未完成能力评估" :image-size="80" />
                  </div>
                </el-tab-pane>

                <!-- Tab 2: 智能培训推荐 -->
                <el-tab-pane label="智能培训推荐" name="recommend">
                  <div v-loading="recommendLoading" class="recommend-container">
                    <el-alert
                      title="基于系统核心智能算法分析推荐"
                      type="success"
                      :closable="false"
                      style="margin-bottom: 20px;"
                      show-icon
                    />
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
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false" round>关 闭 窗 口</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Aim, MagicStick, Phone, Reading, Position } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
// 🔥 新增：引入请求工具和提示框
import request from '../utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
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
    setTimeout(() => {
      isMatching.value = false
    }, 500)
  }
}

// 详情弹窗相关逻辑
const detailVisible = ref(false)
const detailTitle = ref('')
const detailData = ref(null)
const detailSkill = ref(null)
const activeDetailTab = ref('skills')
const recommendPlans = ref([])
const recommendLoading = ref(false)

const customColors = [
  { color: '#f56c6c', percentage: 40 },
  { color: '#e6a23c', percentage: 60 },
  { color: '#5cb87a', percentage: 80 },
  { color: '#1989fa', percentage: 100 },
]

const getDomainName = (val) => {
  return ['计算机科学', '康复医学', '深度交叉'][val] || '未知'
}
const getDomainTag = (val) => {
  return ['', 'success', 'warning'][val] || 'info'
}
const getEmploymentName = (val) => {
  return ['在校培养', '科研院所', '企业就职'][val] || '未知'
}

const handleViewDetail = async (item) => {
  detailTitle.value = `匹配档案详情 - [${item.name}]`
  detailData.value = { ...item } // 先放一些基础信息占位
  detailSkill.value = null
  recommendPlans.value = []
  activeDetailTab.value = 'skills'
  detailVisible.value = true
  recommendLoading.value = true
  
  if (item.id) {
    try {
      // 并发拉取档案、技能和培训推荐数据
      const [profileRes, skillRes, recRes] = await Promise.all([
        request.get(`/sys-talent-profile/${item.id}`).catch(() => ({ code: 500 })),
        request.get(`/sys-talent-skill/talent/${item.id}`).catch(() => ({ code: 500 })),
        request.get(`/api/training/recommend/${item.id}`).catch(() => ({ code: 500 }))
      ])
      
      if (profileRes.code === 200 && profileRes.data) {
        // 关键修复：确保从后端获取的数据正确覆盖现有数据
        const data = profileRes.data
        detailData.value = { ...detailData.value, ...data }
        // 强制映射
        detailData.value.realName = data.realName || detailData.value.name
        detailData.value.primaryDomain = data.primaryDomain
        detailData.value.employmentStatus = data.employmentStatus
        detailData.value.phone = data.phone
        detailData.value.educationLevel = data.educationLevel
        detailData.value.researchDirection = data.researchDirection || detailData.value.desc
      }
      if (skillRes.code === 200 && skillRes.data) {
        detailSkill.value = skillRes.data
      }
      if (recRes.code === 200) {
        recommendPlans.value = recRes.data || []
      }
    } catch (error) {
      console.error('获取详情数据失败:', error)
    } finally {
      recommendLoading.value = false
    }
  } else {
    recommendLoading.value = false
  }
}

const goToTalentProfile = () => {
  detailVisible.value = false
  router.push('/talent')
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
.custom-timeline {
  margin-top: 10px;
}
.timeline-card {
  margin-bottom: 10px;
  border-radius: 8px;
}
.plan-title {
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.plan-desc {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}
.recommend-container {
  min-height: 200px;
}

/* 详情弹窗高级样式 */
:deep(.custom-detail-dialog) { border-radius: 12px; overflow: hidden; }
:deep(.custom-detail-dialog .el-dialog__header) { background-color: #f5f7fa; margin-right: 0; padding-bottom: 20px; }
.profile-card { text-align: center; height: 100%; border: 1px solid #ebeef5; border-radius: 8px; }
.avatar-wrapper { margin-top: 10px; margin-bottom: 15px; }
.custom-avatar { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); font-size: 32px; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
.profile-name { margin: 0 0 15px; font-size: 20px; color: #303133; font-weight: bold; }
.profile-tags { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.info-list { text-align: left; padding: 0 5px; margin-top: 15px; }
.info-item { display: flex; align-items: flex-start; margin-bottom: 15px; color: #606266; font-size: 14px; }
.info-item .el-icon { margin-right: 12px; font-size: 18px; color: #409EFF; margin-top: 2px; }
.direction-item { align-items: flex-start; }
.direction-text { flex: 1; line-height: 1.5; }

.skill-card { height: 100%; display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 8px; }
.skill-details { padding: 5px 0; }
.progress-item { margin-bottom: 16px; }
.progress-item .label { display: block; font-size: 13px; color: #606266; margin-bottom: 6px; font-weight: 500; }
.strong-points-box { margin-top: 25px; padding: 15px 20px; background-color: #f0f9eb; border-radius: 8px; border-left: 4px solid #67c23a; }
.box-title { font-weight: bold; color: #67c23a; margin-bottom: 10px; font-size: 14px; }
.strong-points-box p { margin: 0; font-size: 13px; color: #606266; line-height: 1.6; }
</style>