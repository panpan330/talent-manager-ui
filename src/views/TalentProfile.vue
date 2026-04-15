<template>
  <div class="talent-container">
    <div class="toolbar">
      <el-form :inline="true" class="search-form">
        <el-form-item label="人才姓名">
          <el-input placeholder="请输入姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="主攻领域">
          <el-select placeholder="全部领域" style="width: 150px">
            <el-option label="计算机科学" value="0"></el-option>
            <el-option label="康复医学" value="1"></el-option>
            <el-option label="深度交叉" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="action-btns">
        <el-button type="success" :icon="Plus">新增人才档案</el-button>
      </div>
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe highlight-current-row>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="realName" label="姓名" width="120" />
      <el-table-column prop="primaryDomain" label="主攻领域" width="150">
        <template #default="scope">
          <el-tag v-if="scope.row.primaryDomain === 0" type="primary">计算机科学</el-tag>
          <el-tag v-else-if="scope.row.primaryDomain === 1" type="success">康复医学</el-tag>
          <el-tag v-else type="warning">深度交叉</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="educationLevel" label="最高学历" width="120" />
      <el-table-column prop="researchDirection" label="主要研究方向" min-width="200" />
      <el-table-column prop="employmentStatus" label="就业状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.employmentStatus === 0" type="info">在校培养</el-tag>
          <el-tag v-else-if="scope.row.employmentStatus === 1" type="success">科研院所</el-tag>
          <el-tag v-else type="danger">企业就职</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default>
          <el-button size="small" type="primary" link>编辑</el-button>
          <el-button size="small" type="success" link>技能画像</el-button>
          <el-button size="small" type="danger" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-box">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="1"
        :page-sizes="[10, 20, 50]"
      />
    </div>
  </div>
</template>

<script setup>
import { Search, Plus } from '@element-plus/icons-vue'
import { ref } from 'vue'

// 咱们先写死一条假数据看看效果，一会再用 Axios 从 Java 后端拉取真数据！
const tableData = ref([
  {
    id: 1,
    realName: '潘航宇',
    primaryDomain: 0, // 0代表计算机科学
    educationLevel: '本科',
    researchDirection: '康复医疗信息系统开发',
    employmentStatus: 0 // 0代表在校培养
  }
])
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.pagination-box {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>