<template>
  <div class="talent-container">
    <el-card shadow="never" class="search-box">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="人才姓名">
          <el-input v-model="queryParams.realName" placeholder="输入姓名搜索" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-select v-model="queryParams.primaryDomain" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="item in domainDictList" :key="item.dictValue" :label="item.dictLabel" :value="parseInt(item.dictValue)" />
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
      <el-table-column label="姓名" width="120" align="center">
        <template #default="scope">
            <el-link type="primary" :underline="'never'" @click="handleViewDetail(scope.row)">
              {{ scope.row.realName }}
            </el-link>
          </template>
      </el-table-column>
      <el-table-column label="主攻领域" width="150" align="center">
        <template #default="scope">
          <el-tag :type="getDomainTag(scope.row.primaryDomain)">
            {{ getDomainName(scope.row.primaryDomain) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="researchDirection" label="研究方向" min-width="200" show-overflow-tooltip />
      <el-table-column prop="phone" label="联系电话" width="150" align="center" />
      <el-table-column label="操作" width="400" fixed="right" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="small" type="primary" link icon="SetUp" @click="handleEditSkill(scope.row)">技能打分</el-button>
          <el-button size="small" type="warning" link icon="PieChart" @click="handleShowRadar(scope.row)">技能画像</el-button>
          <el-button size="small" type="success" link icon="Reading" @click="handleViewDetail(scope.row, 'recommend')">培训推荐</el-button>
          <el-button size="small" type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px">
      <el-alert title="您可以手动录入，也可上传简历（PDF格式）让系统自动解析" type="info" :closable="false" style="margin-bottom: 15px;" />
      <el-upload
        class="upload-demo"
        action="#"
        :auto-upload="false"
        :on-change="handleResumeUpload"
        :show-file-list="false"
        accept=".pdf"
        style="margin-bottom: 20px; text-align: center;"
      >
        <el-button type="warning" icon="Document" :loading="parsingResume">
          上传 PDF 简历智能解析
        </el-button>
      </el-upload>
      <el-form :model="form" label-width="80px">
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="归属专家" v-if="isAdmin">
          <el-select v-model="form.userId" placeholder="请选择归属教研/专家" style="width: 100%">
            <el-option v-for="item in experts" :key="item.id" :label="item.realName || item.username" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-select v-model="form.primaryDomain" placeholder="请选择主攻领域" style="width: 100%">
            <el-option v-for="item in domainDictList" :key="item.dictValue" :label="item.dictLabel" :value="parseInt(item.dictValue)" />
          </el-select>
        </el-form-item>
        <el-form-item label="最高学历">
          <el-select v-model="form.educationLevel" placeholder="请选择学历" style="width: 100%">
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
            <el-option label="博士后" value="博士后" />
          </el-select>
        </el-form-item>
        <el-form-item label="就业状态">
          <el-radio-group v-model="form.employmentStatus">
            <el-radio :value="0">在校培养</el-radio>
            <el-radio :value="1">科研院所</el-radio>
            <el-radio :value="2">企业就职</el-radio>
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

    <el-dialog :title="skillDialogTitle" v-model="skillDialogVisible" width="550px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <el-alert title="请为该人才各项核心技能打分 (0-100分)" type="info" :closable="false" style="flex: 1; margin-right: 10px;" />
        <el-button type="success" icon="MagicStick" @click="handleAIEvaluate" :loading="aiEvaluating">
          <b>一键智能评估</b>
        </el-button>
      </div>
      <el-form :model="skillForm" label-width="120px">
        <el-form-item label="编程开发 (Dev)">
          <el-slider v-model="skillForm.devScore" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="算法设计 (Algo)">
          <el-slider v-model="skillForm.algoScore" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="临床评估 (Clinical)">
          <el-slider v-model="skillForm.clinicalScore" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="生理基础 (Physio)">
          <el-slider v-model="skillForm.physioScore" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="硬件交互 (Hardware)">
          <el-slider v-model="skillForm.hardwareScore" :min="0" :max="100" show-input />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSkillForm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="radarTitle" v-model="radarVisible" width="650px" center destroy-on-close custom-class="high-end-radar-dialog">
      <div class="hologram-container">
        <!-- 3D Hologram Character SVG -->
        <svg viewBox="0 0 200 300" class="hologram-svg">
          <defs>
            <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ff0055" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#ff00aa" stop-opacity="0.3" />
            </linearGradient>
            <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <!-- Outer Glow -->
          <g filter="url(#blur)" stroke="url(#glow)" stroke-width="3" fill="none">
            <path d="M100 20 C120 20, 130 40, 130 70 C130 90, 115 100, 100 110 C85 100, 70 90, 70 70 C70 40, 80 20, 100 20 Z" />
            <path d="M85 105 L85 120 L115 120 L115 105" />
            <path d="M85 120 C50 120, 30 140, 30 170 L30 200 L60 200 L60 280 L140 280 L140 200 L170 200 L170 170 C170 140, 150 120, 115 120" />
            <line x1="100" y1="20" x2="100" y2="110" />
            <line x1="75" y1="50" x2="125" y2="50" />
            <line x1="70" y1="70" x2="130" y2="70" />
            <line x1="100" y1="120" x2="100" y2="280" />
            <line x1="60" y1="150" x2="140" y2="150" />
            <line x1="50" y1="180" x2="150" y2="180" />
            <line x1="60" y1="210" x2="140" y2="210" />
            <line x1="60" y1="240" x2="140" y2="240" />
          </g>
          <!-- Core Solid Lines -->
          <g stroke="#ff0055" stroke-width="2.5" fill="none" opacity="1">
            <path d="M100 20 C120 20, 130 40, 130 70 C130 90, 115 100, 100 110 C85 100, 70 90, 70 70 C70 40, 80 20, 100 20 Z" />
            <path d="M85 105 L85 120 L115 120 L115 105" />
            <path d="M85 120 C50 120, 30 140, 30 170 L30 200 L60 200 L60 280 L140 280 L140 200 L170 200 L170 170 C170 140, 150 120, 115 120" />
            <line x1="100" y1="20" x2="100" y2="110" />
            <line x1="75" y1="50" x2="125" y2="50" />
            <line x1="70" y1="70" x2="130" y2="70" />
            <line x1="100" y1="120" x2="100" y2="280" />
            <line x1="60" y1="150" x2="140" y2="150" />
            <line x1="50" y1="180" x2="150" y2="180" />
            <line x1="60" y1="210" x2="140" y2="210" />
            <line x1="60" y1="240" x2="140" y2="240" />
          </g>
        </svg>
        <div id="radarChart" style="width: 100%; height: 450px;"></div>
      </div>
      <template #footer>
        <div style="font-size: 14px; color: #ff0055; text-shadow: 0 0 8px #ff0055; letter-spacing: 2px; font-weight: bold;">
          /// SYSTEM CORE: REAL-TIME HOLOGRAPHIC SCAN ///
        </div>
      </template>
    </el-dialog>

    <!-- 智能培训推荐弹窗 -->
    <el-dialog :title="recommendTitle" v-model="recommendVisible" width="650px" destroy-on-close>
      <div v-loading="recommendLoading">
        <el-alert
          title="基于系统核心智能算法分析推荐"
          type="success"
          :closable="false"
          style="margin-bottom: 20px;"
          show-icon
        />
        <el-timeline>
          <el-timeline-item
            v-for="(plan, index) in recommendPlans"
            :key="index"
            :type="plan.difficultyLevel === 3 ? 'danger' : (plan.difficultyLevel === 2 ? 'warning' : 'primary')"
            :size="plan.difficultyLevel === 3 ? 'large' : 'normal'"
            :hollow="true"
          >
            <el-card shadow="hover" style="margin-bottom: 10px;">
              <h4 style="margin-top: 0;">{{ plan.planName }}
                <el-tag size="small" style="margin-left: 10px;" :type="getDomainTag(plan.targetDomain)">
                  {{ getDomainName(plan.targetDomain) }}
                </el-tag>
                <el-tag size="small" type="info" style="margin-left: 5px;">
                  难度: L{{ plan.difficultyLevel }}
                </el-tag>
              </h4>
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">{{ plan.contentDesc }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-if="recommendPlans.length === 0" description="暂无适合的培训计划推荐" />
      </div>
      <template #footer>
        <el-button @click="recommendVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 个人详细信息弹窗 (高级版) -->
    <el-dialog :title="detailTitle" v-model="detailVisible" width="900px" destroy-on-close custom-class="custom-detail-dialog">
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <!-- 左侧：个人基本档案卡片 -->
          <el-col :span="8">
            <el-card shadow="never" class="profile-card">
              <div class="avatar-wrapper">
                <el-avatar :size="90" class="custom-avatar">{{ detailData.realName.charAt(0) }}</el-avatar>
              </div>
              <h3 class="profile-name">{{ detailData.realName }}</h3>
              <div class="profile-tags">
                <el-tag :type="getDomainTag(detailData.primaryDomain)" effect="dark" round>
                  {{ getDomainName(detailData.primaryDomain) }}
                </el-tag>
                <el-tag type="info" effect="plain" round>
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
                  <span class="direction-text" :title="detailData.researchDirection">{{ detailData.researchDirection || '暂无方向' }}</span>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：详情面板区 -->
          <el-col :span="16">
            <el-card shadow="never" class="skill-card">
              <el-tabs v-model="activeDetailTab" class="detail-tabs">
                <!-- Tab 1: 能力评估 -->
                <el-tab-pane label="综合能力评估" name="skills">
                  <div v-if="detailSkill" class="skill-details">
                    <div class="skill-progress">
                      <div class="progress-item">
                        <span class="label">编程开发 (Dev)</span>
                        <el-progress :percentage="detailSkill.devScore" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">算法设计 (Algo)</span>
                        <el-progress :percentage="detailSkill.algoScore" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">临床评估 (Clinical)</span>
                        <el-progress :percentage="detailSkill.clinicalScore" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">生理基础 (Physio)</span>
                        <el-progress :percentage="detailSkill.physioScore" :color="customColors" :stroke-width="10" />
                      </div>
                      <div class="progress-item">
                        <span class="label">硬件交互 (Hardware)</span>
                        <el-progress :percentage="detailSkill.hardwareScore" :color="customColors" :stroke-width="10" />
                      </div>
                    </div>
                    
                    <div class="strong-points-box">
                      <div class="box-title">🌟 核心优势分析</div>
                      <p>{{ detailSkill.strongPoints || '系统正在跟踪分析中...' }}</p>
                    </div>
                  </div>
                  <div v-else class="empty-skill">
                    <el-empty description="尚未完成能力评估" :image-size="80" />
                    <el-button type="primary" plain size="small" @click="detailVisible=false; handleEditSkill(detailData)">去打分</el-button>
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

                <!-- Tab 3: 详细履历 -->
                <el-tab-pane label="教育与工作履历" name="resume">
                  <div class="resume-container">
                    <!-- 教育经历模块 -->
                    <div class="resume-header">
                      <span class="resume-title"><el-icon><Reading /></el-icon> 教育经历</span>
                      <el-button type="primary" link size="small" @click="openEduDialog"><el-icon><Plus /></el-icon> 添加</el-button>
                    </div>
                    <el-timeline v-if="eduList.length > 0" class="custom-timeline">
                      <el-timeline-item
                        v-for="edu in eduList"
                        :key="edu.id"
                        :timestamp="`${edu.startDate} 至 ${edu.endDate}`"
                        placement="top"
                        type="primary"
                        hollow
                      >
                        <el-card shadow="hover" class="timeline-card">
                          <div class="edu-card-header">
                            <h4 class="plan-title" style="margin-bottom: 5px;">{{ edu.schoolName }}</h4>
                            <el-button type="danger" link size="small" @click="handleDeleteEdu(edu.id)"><el-icon><Delete /></el-icon></el-button>
                          </div>
                          <p class="plan-desc">{{ edu.major }} | {{ edu.degree }}</p>
                        </el-card>
                      </el-timeline-item>
                    </el-timeline>
                    <div v-else class="empty-skill">
                      <el-empty description="暂无教育经历记录" :image-size="60" />
                    </div>

                    <el-divider border-style="dashed" />

                    <!-- 项目与工作履历模块 -->
                    <div class="resume-header">
                      <span class="resume-title"><el-icon><Position /></el-icon> 项目与工作履历</span>
                      <el-button type="primary" link size="small" @click="openExpDialog"><el-icon><Plus /></el-icon> 添加</el-button>
                    </div>
                    <el-timeline v-if="expList.length > 0" class="custom-timeline">
                      <el-timeline-item
                        v-for="exp in expList"
                        :key="exp.id"
                        :timestamp="`${exp.startDate} 至 ${exp.endDate}`"
                        placement="top"
                        type="success"
                        hollow
                      >
                        <el-card shadow="hover" class="timeline-card">
                          <div class="edu-card-header">
                            <h4 class="plan-title" style="margin-bottom: 5px;">{{ exp.organization }}</h4>
                            <el-button type="danger" link size="small" @click="handleDeleteExp(exp.id)"><el-icon><Delete /></el-icon></el-button>
                          </div>
                          <p class="plan-desc" style="font-weight: bold; margin-bottom: 5px;">角色/职务：{{ exp.position }}</p>
                          <p class="plan-desc">{{ exp.description }}</p>
                        </el-card>
                      </el-timeline-item>
                    </el-timeline>
                    <div v-else class="empty-skill">
                      <el-empty description="暂无工作履历记录" :image-size="60" />
                    </div>
                  </div>
                </el-tab-pane>

                <!-- Tab 4: 科研成果与专利 -->
                <el-tab-pane label="科研与专利成果" name="achievement">
                  <div class="resume-container">
                    <div class="resume-header">
                      <span class="resume-title"><el-icon><Trophy /></el-icon> 成果列表</span>
                      <el-button type="primary" link size="small" @click="openAchieveDialog"><el-icon><Plus /></el-icon> 录入成果</el-button>
                    </div>
                    <el-timeline v-if="achieveList.length > 0" class="custom-timeline">
                      <el-timeline-item
                        v-for="achieve in achieveList"
                        :key="achieve.id"
                        :timestamp="achieve.publishDate"
                        placement="top"
                        :type="getAchieveTypeColor(achieve.type)"
                        hollow
                      >
                        <el-card shadow="hover" class="timeline-card">
                          <div class="edu-card-header">
                            <h4 class="plan-title" style="margin-bottom: 5px;">
                              {{ achieve.title }}
                              <el-tag size="small" style="margin-left: 10px;" :type="getAchieveTypeColor(achieve.type)">
                                {{ getAchieveTypeName(achieve.type) }}
                              </el-tag>
                            </h4>
                            <el-button type="danger" link size="small" @click="handleDeleteAchieve(achieve.id)"><el-icon><Delete /></el-icon></el-button>
                          </div>
                          <p class="plan-desc">
                            <span v-if="achieve.url" style="margin-left: 5px;">
                              <el-link type="primary" :underline="'hover'" :href="achieve.url" target="_blank">查看证明材料</el-link>
                            </span>
                          </p>
                        </el-card>
                      </el-timeline-item>
                    </el-timeline>
                    <div v-else class="empty-skill">
                      <el-empty description="暂无科研成果记录" :image-size="60" />
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

    <!-- 添加教育经历的弹窗 -->
    <el-dialog title="添加教育经历" v-model="eduDialogVisible" width="500px" destroy-on-close>
      <el-form :model="eduForm" label-width="80px" ref="eduFormRef">
        <el-form-item label="学校名称" prop="schoolName" :rules="[{ required: true, message: '请输入学校名称', trigger: 'blur' }]">
          <el-input v-model="eduForm.schoolName" placeholder="如：清华大学" />
        </el-form-item>
        <el-form-item label="所获学位" prop="degree" :rules="[{ required: true, message: '请输入学位', trigger: 'blur' }]">
          <el-input v-model="eduForm.degree" placeholder="如：学士 / 硕士 / 博士" />
        </el-form-item>
        <el-form-item label="专业名称" prop="major" :rules="[{ required: true, message: '请输入专业名称', trigger: 'blur' }]">
          <el-input v-model="eduForm.major" placeholder="如：计算机科学与技术" />
        </el-form-item>
        <el-form-item label="入学时间" prop="startDate" :rules="[{ required: true, message: '请选择入学时间', trigger: 'change' }]">
          <el-date-picker v-model="eduForm.startDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="毕业时间" prop="endDate" :rules="[{ required: true, message: '请选择毕业时间', trigger: 'change' }]">
          <el-date-picker v-model="eduForm.endDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="eduDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEduForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 添加工作履历的弹窗 -->
    <el-dialog title="添加项目/工作履历" v-model="expDialogVisible" width="550px" destroy-on-close>
      <el-form :model="expForm" label-width="100px" ref="expFormRef">
        <el-form-item label="单位/课题组" prop="organization" :rules="[{ required: true, message: '请输入单位或课题组名称', trigger: 'blur' }]">
          <el-input v-model="expForm.organization" placeholder="如：某某研究院脑机接口实验室" />
        </el-form-item>
        <el-form-item label="担任职务" prop="position" :rules="[{ required: true, message: '请输入职务角色', trigger: 'blur' }]">
          <el-input v-model="expForm.position" placeholder="如：核心开发人员 / 研究助理" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate" :rules="[{ required: true, message: '请选择开始时间', trigger: 'change' }]">
          <el-date-picker v-model="expForm.startDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker v-model="expForm.endDate" type="date" placeholder="选择日期 (留空表示至今)" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工作描述" prop="description">
          <el-input v-model="expForm.description" type="textarea" :rows="4" placeholder="请简要描述您的工作内容或项目成果" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="expDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitExpForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 添加科研成果的弹窗 -->
    <el-dialog title="录入科研/专利成果" v-model="achieveDialogVisible" width="550px" destroy-on-close>
      <el-form :model="achieveForm" label-width="110px" ref="achieveFormRef">
        <el-form-item label="成果类型" prop="type" :rules="[{ required: true, message: '请选择成果类型', trigger: 'change' }]">
          <el-select v-model="achieveForm.type" placeholder="请选择类型" style="width: 100%;">
            <el-option label="SCI论文 (Paper)" :value="0" />
            <el-option label="发明专利 (Patent)" :value="1" />
            <el-option label="软件著作权 (Software)" :value="2" />
            <el-option label="其他成果 (Other)" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="成果名称" prop="title" :rules="[{ required: true, message: '请输入成果名称/标题', trigger: 'blur' }]">
          <el-input v-model="achieveForm.title" placeholder="如：基于脑机接口的智能轮椅控制系统" />
        </el-form-item>
        <el-form-item label="发表时间" prop="publishDate" :rules="[{ required: true, message: '请选择发表/授权日期', trigger: 'change' }]">
          <el-date-picker v-model="achieveForm.publishDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="证明材料链接" prop="url">
          <el-input v-model="achieveForm.url" placeholder="如：https://doi.org/... (选填)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="achieveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAchieveForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Refresh, Plus, Download, Edit, PieChart, Delete, Reading, Phone, Position, Trophy } from '@element-plus/icons-vue';
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
const parsingResume = ref(false)
const form = reactive({
  id: null,
  userId: null,
  realName: '',
  primaryDomain: 0,
  educationLevel: '',
  employmentStatus: 0,
  phone: '',
  researchDirection: ''
})

// 技能表单弹窗控制
const skillDialogVisible = ref(false)
const skillDialogTitle = ref('')
const aiEvaluating = ref(false)
const skillForm = reactive({
  talentId: null,
  devScore: 0,
  algoScore: 0,
  clinicalScore: 0,
  physioScore: 0,
  hardwareScore: 0
})

// 雷达图弹窗控制
const radarVisible = ref(false)
const radarTitle = ref('')

// 智能培训推荐弹窗控制
const recommendVisible = ref(false)
const recommendTitle = ref('')
const recommendLoading = ref(false)
const recommendPlans = ref([])

// 个人详细信息弹窗控制
const detailVisible = ref(false)
const detailTitle = ref('')
const detailData = ref(null)
const detailSkill = ref(null)
const activeDetailTab = ref('skills')

// --- 教育履历相关数据 ---
const eduList = ref([])
const eduDialogVisible = ref(false)
const eduFormRef = ref(null)
const eduForm = reactive({
  talentId: null,
  schoolName: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: ''
})

// --- 项目/工作履历相关数据 ---
const expList = ref([])
const expDialogVisible = ref(false)
const expFormRef = ref(null)
const expForm = reactive({
  talentId: null,
  organization: '',
  position: '',
  startDate: '',
  endDate: '',
  description: ''
})

// --- 科研成果相关数据 ---
const achieveList = ref([])
const achieveDialogVisible = ref(false)
const achieveFormRef = ref(null)
const achieveForm = reactive({
  talentId: null,
  type: 0,
  title: '',
  publishDate: '',
  url: ''
})
const customColors = [
  { color: '#f56c6c', percentage: 40 },
  { color: '#e6a23c', percentage: 60 },
  { color: '#5cb87a', percentage: 80 },
  { color: '#1989fa', percentage: 100 },
]

const isAdmin = ref(localStorage.getItem('role') === 'admin')
const experts = ref([])

// --- 核心方法 ---

// --- 动态数据字典逻辑 ---
const domainDictList = ref([])
const getDomainDict = async () => {
  try {
    const res = await request.get('/sys-dict-data/list?dictType=sys_domain')
    if (res.code === 200) {
      domainDictList.value = res.data
    }
  } catch (e) {
    console.error('获取领域字典失败', e)
  }
}

// 1. 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const role = localStorage.getItem('role') || 'user'
    const expertId = localStorage.getItem('userId')
    const params = { ...queryParams }
    
    // 如果是教研专家，只看自己录入的学生
    if (role === 'expert' && expertId) {
      params.role = role
      params.expertId = expertId
    }

    const res = await request.get('/sys-talent-profile/list', { params })
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
  Object.assign(form, { id: null, userId: null, realName: '', primaryDomain: 0, educationLevel: '', employmentStatus: 0, phone: '', researchDirection: '' })
  dialogVisible.value = true
}
const handleUpdate = (row) => {
  dialogTitle.value = '修改人才信息'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 简历解析功能
const handleResumeUpload = async (file) => {
  if (file.raw.type !== 'application/pdf') {
    return ElMessage.error('目前仅支持 PDF 格式简历')
  }
  
  parsingResume.value = true
  const formData = new FormData()
  formData.append('file', file.raw)
  
  try {
    // 假设后端写了一个原生的上传接口处理 multipart/form-data
    const res = await request.post('/api/resume/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (res.code === 200 && res.data) {
      ElMessage.success('🎉 简历解析成功，已自动填充相关信息！')
      const profile = res.data.profile
      if (profile.educationLevel) form.educationLevel = profile.educationLevel
      if (profile.phone) form.phone = profile.phone
      if (profile.researchDirection) form.researchDirection = profile.researchDirection
    } else {
      ElMessage.warning(res.msg || '解析失败')
    }
  } catch (error) {
    console.error('简历解析异常', error)
    ElMessage.error('文件过大或服务异常')
  } finally {
    parsingResume.value = false
  }
}

// 技能打分操作
const handleEditSkill = async (row) => {
  skillDialogTitle.value = `为 [${row.realName}] 录入技能分数`
  // 尝试拉取现有的技能数据
  try {
    const res = await request.get(`/sys-talent-skill/talent/${row.id}`)
    if (res.code === 200 && res.data) {
      Object.assign(skillForm, res.data)
    } else {
      // 没录过，或者是 404，就给初始值
      Object.assign(skillForm, {
        id: null, // 清空旧的 id
        talentId: row.id,
        devScore: 50,
        algoScore: 50,
        clinicalScore: 50,
        physioScore: 50,
        hardwareScore: 50
      })
    }
    skillDialogVisible.value = true
  } catch (error) {
    // 捕获到网络异常（比如 404）也认为是没录过数据
    Object.assign(skillForm, {
        id: null,
        talentId: row.id,
        devScore: 50,
        algoScore: 50,
        clinicalScore: 50,
        physioScore: 50,
        hardwareScore: 50
    })
    skillDialogVisible.value = true
  }
}

// 提交技能表单
const submitSkillForm = async () => {
  const res = await request.post('/sys-talent-skill/save', skillForm)
  if (res.code === 200) {
    ElMessage.success('技能分数保存成功')
    skillDialogVisible.value = false
  } else {
    ElMessage.error(res.msg || '保存失败')
  }
}

// 触发一键智能评估
const handleAIEvaluate = async () => {
  if (!skillForm.talentId) return
  aiEvaluating.value = true
  try {
    const res = await request.get(`/sys-talent-skill/ai-evaluate/${skillForm.talentId}`)
    if (res.code === 200 && res.data) {
      skillForm.devScore = res.data.devScore
      skillForm.algoScore = res.data.algoScore
      skillForm.clinicalScore = res.data.clinicalScore
      skillForm.physioScore = res.data.physioScore
      skillForm.hardwareScore = res.data.hardwareScore
      ElMessage.success('⚡ 智能评估已完成，已根据履历自动填充推荐分数')
    } else {
      ElMessage.warning(res.msg || '评估失败')
    }
  } catch (error) {
    console.error('智能评估失败', error)
    ElMessage.error('服务器异常')
  } finally {
    aiEvaluating.value = false
  }
}

// 提交表单（调用后端规范化后的 saveOrUpdate）
const submitForm = async () => {
  // 如果是新增，自动绑定当前专家的 ID (如果未手动选择)
  if (!form.userId) {
    form.userId = localStorage.getItem('userId')
  }
  const res = await request.post('/sys-talent-profile/save', form)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getList()
  } else {
    ElMessage.error(res.msg || '保存失败')
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
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(20, 0, 10, 0.8)',
          borderColor: '#ff0055',
          textStyle: { color: '#fff' }
        },
        radar: {
          indicator: [
            { name: '编程开发', max: 100 },
            { name: '算法设计', max: 100 },
            { name: '临床评估', max: 100 },
            { name: '生理基础', max: 100 },
            { name: '硬件交互', max: 100 }
          ],
          shape: 'polygon',
          center: ['50%', '50%'],
          radius: '65%',
          splitNumber: 5,
          name: {
            textStyle: {
              color: '#ff0055',
              fontSize: 14,
              fontWeight: 'bold',
              textShadowColor: '#ff0055',
              textShadowBlur: 10
            }
          },
          splitLine: {
            lineStyle: {
              color: [
                'rgba(255, 0, 85, 0.1)', 'rgba(255, 0, 85, 0.2)',
                'rgba(255, 0, 85, 0.4)', 'rgba(255, 0, 85, 0.6)',
                'rgba(255, 0, 85, 0.8)'
              ].reverse()
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(255, 0, 85, 0.05)', 'rgba(255, 0, 85, 0.02)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 0, 85, 0.5)'
            }
          }
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#ff0055',
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: '#ff0055',
              shadowBlur: 10
            },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(255, 0, 85, 0.1)' },
                { offset: 1, color: 'rgba(255, 0, 85, 0.6)' }
              ])
            },
            lineStyle: {
              color: '#ff0055',
              width: 2,
              shadowColor: '#ff0055',
              shadowBlur: 15
            }
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

// 7. 智能培训推荐接口调用 (现在已整合进详情面板)
// 这个方法可以删掉，不过为了兼容旧代码我们让它直接跳转到详情页的“推荐”Tab

// 8. 查看个人详细信息
const handleViewDetail = async (row, tab = 'skills') => {
  detailTitle.value = `人才档案详情 - [${row.realName}]`
  detailData.value = row
  detailSkill.value = null
  recommendPlans.value = []
  eduList.value = []
  expList.value = []
  achieveList.value = []
  activeDetailTab.value = tab
  detailVisible.value = true
  recommendLoading.value = true

  try {
    // 并发拉取技能数据、培训推荐数据、教育经历、工作履历、科研成果
    const [skillRes, recRes, eduRes, expRes, achieveRes] = await Promise.all([
      request.get(`/sys-talent-skill/talent/${row.id}`).catch(() => ({ code: 500 })),
      request.get(`/api/training/recommend/${row.id}`).catch(() => ({ code: 500 })),
      request.get(`/biz-talent-education/list/${row.id}`).catch(() => ({ code: 500 })),
      request.get(`/biz-talent-experience/list/${row.id}`).catch(() => ({ code: 500 })),
      request.get(`/biz-talent-achievement/list/${row.id}`).catch(() => ({ code: 500 }))
    ])
    
    if (skillRes.code === 200 && skillRes.data) {
      detailSkill.value = skillRes.data
    }
    if (recRes.code === 200) {
      recommendPlans.value = recRes.data || []
    }
    if (eduRes.code === 200) {
      eduList.value = eduRes.data || []
    }
    if (expRes.code === 200) {
      expList.value = expRes.data || []
    }
    if (achieveRes.code === 200) {
      achieveList.value = achieveRes.data || []
    }
  } catch (error) {
    console.error('获取详情数据失败:', error)
  } finally {
    recommendLoading.value = false
  }
}

// --- 教育履历交互逻辑 ---
const loadEduList = async (talentId) => {
  const res = await request.get(`/biz-talent-education/list/${talentId}`)
  if (res.code === 200) {
    eduList.value = res.data || []
  }
}

const openEduDialog = () => {
  if (eduFormRef.value) eduFormRef.value.resetFields()
  eduForm.talentId = detailData.value.id
  eduForm.schoolName = ''
  eduForm.degree = ''
  eduForm.major = ''
  eduForm.startDate = ''
  eduForm.endDate = ''
  eduDialogVisible.value = true
}

const submitEduForm = () => {
  eduFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = await request.post('/biz-talent-education/save', eduForm)
      if (res.code === 200) {
        ElMessage.success('教育经历添加成功')
        eduDialogVisible.value = false
        loadEduList(detailData.value.id)
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    }
  })
}

const handleDeleteEdu = (id) => {
  ElMessageBox.confirm('确定要删除这条教育经历吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await request.delete(`/biz-talent-education/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadEduList(detailData.value.id)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

// --- 工作履历交互逻辑 ---
const loadExpList = async (talentId) => {
  const res = await request.get(`/biz-talent-experience/list/${talentId}`)
  if (res.code === 200) {
    expList.value = res.data || []
  }
}

const openExpDialog = () => {
  if (expFormRef.value) expFormRef.value.resetFields()
  expForm.talentId = detailData.value.id
  expForm.organization = ''
  expForm.position = ''
  expForm.startDate = ''
  expForm.endDate = ''
  expForm.description = ''
  expDialogVisible.value = true
}

const submitExpForm = () => {
  expFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = await request.post('/biz-talent-experience/save', expForm)
      if (res.code === 200) {
        ElMessage.success('工作履历添加成功')
        expDialogVisible.value = false
        loadExpList(detailData.value.id)
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    }
  })
}

const handleDeleteExp = (id) => {
  ElMessageBox.confirm('确定要删除这条工作履历吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await request.delete(`/biz-talent-experience/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadExpList(detailData.value.id)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

// --- 科研成果交互逻辑 ---
const loadAchieveList = async (talentId) => {
  const res = await request.get(`/biz-talent-achievement/list/${talentId}`)
  if (res.code === 200) {
    achieveList.value = res.data || []
  }
}

const openAchieveDialog = () => {
  if (achieveFormRef.value) achieveFormRef.value.resetFields()
  achieveForm.talentId = detailData.value.id
  achieveForm.type = 0
  achieveForm.title = ''
  achieveForm.publishDate = ''
  achieveForm.url = ''
  achieveDialogVisible.value = true
}

const submitAchieveForm = () => {
  achieveFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = await request.post('/biz-talent-achievement/save', achieveForm)
      if (res.code === 200) {
        ElMessage.success('科研成果录入成功')
        achieveDialogVisible.value = false
        loadAchieveList(detailData.value.id)
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    }
  })
}

const handleDeleteAchieve = (id) => {
  ElMessageBox.confirm('确定要删除这条科研成果吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await request.delete(`/biz-talent-achievement/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadAchieveList(detailData.value.id)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  }).catch(() => {})
}

// --- 辅助工具函数 ---
const getAchieveTypeName = (val) => {
  const map = { 0: 'SCI论文', 1: '发明专利', 2: '软件著作权', 3: '其他成果' }
  return map[val] || '未知'
}
const getAchieveTypeColor = (val) => {
  const map = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'info' }
  return map[val] || 'info'
}
const getDomainName = (val) => {
  const item = domainDictList.value.find(d => parseInt(d.dictValue) === val)
  return item ? item.dictLabel : (['计算机科学', '康复医学', '深度交叉'][val] || '未知')
}
const getDomainTag = (val) => {
  return ['', 'success', 'warning'][val] || 'info'
}
const getEmploymentName = (val) => {
  return ['在校培养', '科研院所', '企业就职'][val] || '未知'
}

const getExperts = async () => {
  if (isAdmin.value) {
    try {
      const res = await request.get('/sys-user/listByRole', { params: { roleType: 2 } })
      if (res.code === 200) {
        experts.value = res.data
      }
    } catch (error) {
      console.error('获取专家列表失败:', error)
    }
  }
}

onMounted(() => {
  getDomainDict()
  getList()
  getExperts()
})
</script>

<style scoped>
.talent-container { padding: 20px; }

/* --- 高端全息雷达图样式 --- */
:deep(.high-end-radar-dialog) {
  background: rgba(26, 5, 10, 0.95) !important;
  border: 1px solid rgba(255, 0, 85, 0.4);
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.3), inset 0 0 20px rgba(255, 0, 85, 0.15);
  backdrop-filter: blur(10px);
}
:deep(.high-end-radar-dialog .el-dialog__title) {
  color: #ff0055;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 0, 85, 0.6);
}
:deep(.high-end-radar-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(255, 0, 85, 0.3);
  margin-right: 0;
}
:deep(.high-end-radar-dialog .el-dialog__close) {
  color: #ff0055;
}

.hologram-container {
  position: relative;
  width: 100%;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(255, 0, 85, 0.1) 0%, transparent 70%);
}

.hologram-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 250px;
  opacity: 0.8;
  animation: hologramFloat 4s ease-in-out infinite, hologramFlicker 3s linear infinite;
  pointer-events: none;
}

@keyframes hologramFloat {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -55%); }
}
@keyframes hologramFlicker {
  0%, 100% { opacity: 0.8; }
  90% { opacity: 0.8; }
  92% { opacity: 0.4; }
  94% { opacity: 0.9; }
  96% { opacity: 0.5; }
  98% { opacity: 1; }
}

#radarChart {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

/* --- 档案卡片样式 --- */
.search-box { margin-bottom: 20px; border-radius: 8px; }
.action-bar { margin-bottom: 20px; display: flex; gap: 10px; }
.el-table { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
:deep(.el-table__header) { background-color: #f5f7fa !important; }

/* 详情弹窗高级样式 */
:deep(.custom-detail-dialog) { 
  border-radius: 12px; 
  overflow: hidden; 
}
:deep(.custom-detail-dialog .el-dialog__body) {
  padding: 20px 25px;
  min-height: 550px;
}
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
.card-header { display: flex; align-items: center; font-weight: bold; font-size: 16px; color: #303133; }
.card-header .el-icon { margin-right: 8px; color: #e6a23c; font-size: 18px; }
.skill-details { padding: 5px 0; }
.progress-item { margin-bottom: 16px; }
.progress-item .label { display: block; font-size: 13px; color: #606266; margin-bottom: 6px; font-weight: 500; }
.strong-points-box { margin-top: 25px; padding: 15px 20px; background-color: #f0f9eb; border-radius: 8px; border-left: 4px solid #67c23a; }
.box-title { font-weight: bold; color: #67c23a; margin-bottom: 10px; font-size: 14px; }
.strong-points-box p { margin: 0; font-size: 13px; color: #606266; line-height: 1.6; }
.empty-skill { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 320px; }

/* 培训推荐相关样式 */
.detail-tabs { margin-top: -10px; }
.recommend-container { min-height: 300px; }
.resume-container { padding: 10px 5px; }
.resume-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.resume-title { font-size: 16px; font-weight: bold; color: #303133; display: flex; align-items: center; gap: 8px; }
.edu-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.custom-timeline { padding-top: 10px; padding-left: 5px; }
.timeline-card { border-radius: 8px; border: 1px solid #ebeef5; transition: all 0.3s; }
.timeline-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.plan-title { margin: 0 0 10px 0; font-size: 15px; color: #303133; display: flex; align-items: center; }
.plan-tag { margin-left: 10px; }
.plan-desc { color: #606266; font-size: 13px; margin: 0; line-height: 1.5; }
</style>