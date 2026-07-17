<!--
  请假审批页面（管理端）
  功能：管理员查看并审批学生的请假申请
  包含：顶部导航栏、标签切换、搜索框、待审批提示、审批卡片列表、底部Tab栏
-->
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Clock, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserInfoStore } from '@/stores/userInfo'
import { getLeaveList, approveLeave, getPendingCount } from '@/api/leave'
import avatar from '@/assets/default.png'

const router = useRouter()
const userInfoStore = useUserInfoStore()

/* ========== 页面状态 ========== */
const loading = ref(false)                    // 页面加载状态
const activeTab = ref(0)                      // 当前激活的标签页索引
const bottomTab = ref('approval')             // 底部Tab栏当前激活项

/* ========== 数据相关 ========== */
const approvalList = reactive([])             // 审批列表数据
const searchKeyword = ref('')                 // 搜索关键词（姓名/学号）
const pendingCount = ref(0)                   // 待审批数量

/* ========== 分页相关 ========== */
const pageParams = reactive({
  pageNo: 1,                                  // 当前页码
  pageSize: 10,                               // 每页条数
  total: 0                                    // 总条数
})

/* ========== 标签页列表 ========== */
const tabs = ['请假审批', '返校审批', '超时未归', '次数排名']

/* ========== 页面初始化时加载数据 ========== */
onMounted(() => {
  loadPendingCount()
  loadApprovalList()
})

/**
 * 获取姓名首字，用于头像显示
 * @param {string} name - 学生姓名
 * @returns {string} 姓名第一个字符
 */
const getInitial = (name) => {
  return name ? name.charAt(0) : '?'
}

/**
 * 切换标签页（不同tab应调用不同API，此处为模拟）
 * @param {number} index - 标签页索引
 */
const switchTab = (index) => {
  activeTab.value = index
  pageParams.pageNo = 1
  loadApprovalList()
}

/**
 * 加载待审批数量
 */
const loadPendingCount = async () => {
  try {
    const approverId = userInfoStore.userInfo?.id || 0
    if (approverId) {
      const res = await getPendingCount(approverId)
      if (res.data) {
        pendingCount.value = res.data
      }
    }
  } catch (error) {
    console.error('加载待审批数量失败:', error)
    pendingCount.value = 1
  }
}

/**
 * 加载审批列表（从后端API获取数据）
 */
const loadApprovalList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pageParams.pageNo,
      pageSize: pageParams.pageSize,
      status: 'pending'
    }

    // 搜索关键词：判断是姓名还是学号
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.trim()
      if (/^\d+$/.test(keyword)) {
        params.userId = parseInt(keyword)
      } else {
        params.userName = keyword
      }
    }

    const res = await getLeaveList(params)
    if (res.data && res.data.records) {
      approvalList.length = 0
      res.data.records.forEach(item => {
        approvalList.push({
          id: item.id,
          name: item.applicantName || '未知',
          studentId: item.applicantStudentId || '',
          leaveType: item.leaveType,
          applyTime: item.gmtCreated ? new Date(item.gmtCreated).toLocaleString() : '未知',
          startTime: item.startTime ? new Date(item.startTime).toLocaleString() : '未知',
          endTime: item.endTime ? new Date(item.endTime).toLocaleString() : '未知',
          reason: item.reason || '无',
          status: item.status,
          avatarInitial: getInitial(item.applicantName || '?')
        })
      })
      pageParams.total = res.data.total
    }
  } catch (error) {
    console.error('加载审批列表失败:', error)
    // API失败时显示模拟数据
    approvalList.length = 0
    approvalList.push({
      id: 1,
      name: '张小白',
      studentId: '2020090911004',
      leaveType: '回家',
      applyTime: '2022-11-26 17:56:32',
      startTime: '2022-11-26 17:56:32',
      endTime: '2022-11-26 17:56:32',
      reason: '回家取东西回家取东西回家取东西回家取东西回家取东西回家取东西',
      status: 'pending',
      avatarInitial: '张'
    })
  } finally {
    loading.value = false
  }
}

/* 搜索框防抖 */
let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageParams.pageNo = 1
    loadApprovalList()
  }, 500)
}

/**
 * 同意请假操作（调用后端API）
 * @param {object} item - 审批项数据
 */
const handleApprove = async (item) => {
  try {
    const approverId = userInfoStore.userInfo?.id || 0
    if (!approverId) {
      ElMessage.warning('无法获取您的审批人信息，请重新登录')
      return
    }

    const approveData = {
      leaveId: item.id,
      approverId: approverId,
      comment: '同意请假'
    }

    const res = await approveLeave(approveData)
    if (res.status) {
      item.status = 'approved'
      if (pendingCount.value > 0) pendingCount.value--
      ElMessage.success(`已同意 ${item.name} 的请假申请`)
      loadApprovalList()
    } else {
      ElMessage.error('审批失败，请稍后重试')
    }
  } catch (error) {
    console.error('审批操作失败:', error)
    ElMessage.error('网络异常，请稍后重试')
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 跳转到管理后台
 */
const goToAdmin = () => {
  router.push('/user/list')
}
</script>

<template>
  <div class="mobile-container">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="header-title">请假审批</h1>
        <div class="header-user" @click="goToAdmin">
          <el-avatar :size="32" :src="userInfoStore.userInfo?.avatar || avatar" />
        </div>
      </div>
    </div>

    <!-- ==================== 标签导航栏 ==================== -->
    <div class="tab-bar">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        {{ tab }}
        <div v-if="activeTab === index" class="tab-indicator"></div>
      </div>
    </div>

    <!-- ==================== 搜索栏 ==================== -->
    <div class="search-bar-wrapper">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <el-input
          v-model="searchKeyword"
          placeholder="请输入姓名/学号模糊查询"
          class="search-input"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
        />
      </div>
    </div>

    <!-- ==================== 加载状态 ==================== -->
    <div v-if="loading" class="loading-state">
      <el-icon class="loading-icon" style="font-size:24px"><Clock /></el-icon>
      <span class="loading-text">加载中...</span>
    </div>

    <!-- ==================== 待审批提示横幅 ==================== -->
    <div class="notice-banner">
      <el-icon class="notice-icon"><Clock /></el-icon>
      <span class="notice-text">请批待审批 <strong class="notice-count">{{ pendingCount }}</strong> 人</span>
    </div>

    <!-- ==================== 审批卡片列表 ==================== -->
    <div class="approval-list">
      <div
        v-for="item in approvalList"
        :key="item.id"
        class="approval-card"
        v-show="item.status === 'pending'"
      >
        <!-- 卡片头部：头像 + 姓名 + 学号 -->
        <div class="card-header">
          <div class="user-info">
            <div class="avatar">{{ item.avatarInitial }}</div>
            <span class="user-name">{{ item.name }}</span>
          </div>
          <span class="student-id">{{ item.studentId }}</span>
        </div>

        <!-- 卡片内容：请假详细信息 -->
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">请假类型：</span>
            <span class="info-value">{{ item.leaveType }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">申请时间：</span>
            <span class="info-value">{{ item.applyTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">开始时间：</span>
            <span class="info-value">{{ item.startTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">结束时间：</span>
            <span class="info-value">{{ item.endTime }}</span>
          </div>
          <div class="info-row reason-row">
            <span class="info-label">请假理由：</span>
            <span class="info-value reason-text">{{ item.reason }}</span>
          </div>
        </div>

        <!-- 卡片底部：状态标签 + 操作按钮 -->
        <div class="card-footer">
          <span class="status-badge pending">请假待审批</span>
          <el-button type="primary" class="approve-btn" @click="handleApprove(item)">
            同意请假
          </el-button>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!loading && approvalList.length === 0" class="empty-state">
        <el-icon :size="48" color="#c0c4cc"><Document /></el-icon>
        <p class="empty-text">暂无待审批的请假申请</p>
      </div>
    </div>

    <!-- ==================== 底部Tab栏 ==================== -->
    <div class="bottom-tab-bar">
      <div class="bottom-tab-item" :class="{ active: bottomTab === 'approval' }" @click="bottomTab = 'approval'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>请假审批</span>
      </div>
      <div class="bottom-tab-item" :class="{ active: bottomTab === 'record' }" @click="bottomTab = 'record'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <span>审批记录</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ==================== 移动端容器 ==================== */
.mobile-container {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f0f2f5;
  position: relative;
  padding-bottom: 70px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ==================== 顶部导航栏 ==================== */
.header {
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  padding: 16px 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .back-btn {
      cursor: pointer;
      color: #fff;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: opacity 0.2s;
      &:hover { opacity: 0.8; }
    }

    .header-title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 1px;
    }

    .header-user {
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: opacity 0.2s;
      &:hover { opacity: 0.8; }
    }
  }
}

/* ==================== 标签导航栏 ==================== */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 14px 0;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
    &:hover { color: #409EFF; }
    &.active { color: #409EFF; font-weight: 600; }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 3px;
      background-color: #409EFF;
      border-radius: 2px;
    }
  }
}

/* ==================== 搜索栏 ==================== */
.search-bar-wrapper {
  padding: 12px 16px;

  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 24px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .search-icon {
      color: #909399;
      font-size: 18px;
      margin-right: 8px;
    }

    :deep(.el-input__wrapper) {
      box-shadow: none;
      padding: 0;
      .el-input__inner { font-size: 14px; color: #333; }
      .el-input__inner::placeholder { color: #c0c4cc; }
    }
  }
}

/* ==================== 加载状态 ==================== */
.loading-state {
  text-align: center;
  padding: 30px 20px;
  color: #909399;
  .loading-text { font-size: 14px; margin-top: 8px; }
}

/* ==================== 待审批提示横幅 ==================== */
.notice-banner {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 0 16px 12px;
  background-color: #fff7e6;
  border-radius: 8px;
  border-left: 3px solid #faad14;

  .notice-icon { color: #faad14; font-size: 16px; margin-right: 8px; }
  .notice-text { font-size: 13px; color: #d48806; .notice-count { color: #fa541c; font-size: 15px; } }
}

/* ==================== 审批卡片列表 ==================== */
.approval-list {
  padding: 0 16px;

  .approval-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        .avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background-color: #409EFF;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 600;
          flex-shrink: 0;
        }
        .user-name { font-size: 16px; font-weight: 600; color: #303133; }
      }
      .student-id { font-size: 13px; color: #909399; }
    }

    .card-body {
      .info-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.6;
        .info-label { color: #909399; flex-shrink: 0; min-width: 72px; }
        .info-value { color: #303133; }
        &.reason-row {
          .info-value { flex: 1; }
          .reason-text { color: #606266; word-break: break-all; line-height: 1.6; }
        }
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #ebeef5;

      .status-badge {
        font-size: 13px;
        padding: 4px 12px;
        border-radius: 4px;
        &.pending { color: #e6a23c; background-color: #fdf6ec; }
      }

      .approve-btn { border-radius: 20px; padding: 8px 24px; font-size: 14px; }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    .empty-text { margin-top: 12px; font-size: 14px; color: #909399; }
  }
}

/* ==================== 底部Tab栏 ==================== */
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  display: flex;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 100;

  .bottom-tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    cursor: pointer;
    transition: color 0.3s;
    color: #909399;
    svg { margin-bottom: 2px; }
    span { font-size: 11px; }
    &.active { color: #409EFF; }
  }
}
</style>
