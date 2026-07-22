<template>
  <div class="page-container">
    <header class="view-header">
      <h1>审批列表</h1>
    </header>

    <div class="list-page">
      <!-- 统计条 -->
      <div class="stat-strip">
        <div class="stat-chip stat-chip--active">
          <span class="stat-chip__num">{{ pendingLeaves.length }}</span>
          <span class="stat-chip__label">待处理</span>
        </div>
        <div class="stat-chip stat-chip--done">
          <span class="stat-chip__num">{{ completedLeaves.length }}</span>
          <span class="stat-chip__label">已处理</span>
        </div>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- Tab 切换 -->
        <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
          <van-tab title="请假审批" name="leave">
            <div class="tab-content">
              <div class="filter-bar">
                <van-search
                  v-model="searchText"
                  placeholder="搜索学生姓名或学号"
                  shape="round"
                />
              </div>

              <van-loading v-if="loading" class="loading-center" size="24" />
              <div v-else-if="filteredLeaveItems.length">
                <div
                  v-for="leave in filteredLeaveItems"
                  :key="leave.id"
                  class="leave-card"
                  @click="goDetail(leave, 'leave')"
                >
                  <div class="leave-card__header">
                    <div class="leave-card__student">
                      <span class="student-avatar">{{ (leave.studentName || '?').charAt(0) }}</span>
                      <div>
                        <div class="student-name">{{ leave.studentName }}</div>
                        <div class="student-id">{{ leave.studentId }} | {{ leave.className || leave.college }}</div>
                      </div>
                    </div>
                    <span :class="'status-tag ' + urgencyClass(leave)">{{ urgencyText(leave) }}</span>
                  </div>
                  <div class="leave-card__body">
                    <div class="leave-card__info">
                      <span class="info-badge">{{ leave.leaveType }}</span>
                      <span class="info-badge info-badge--duration">{{ leave.duration }}天</span>
                      <span class="info-badge info-badge--step">{{ leave.currentStep }}/{{ leave.totalSteps }}级审批</span>
                    </div>
                    <div class="leave-card__reason">{{ leave.reason }}</div>
                  </div>
                  <div class="leave-card__footer">
                    <span class="current-approver">当前：{{ leave.currentApprover || '待分配' }}</span>
                    <van-icon name="arrow" color="var(--color-text-muted)" />
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <div class="empty-state__icon">📋</div>
                <div class="empty-state__text">暂无请假待审批</div>
              </div>
            </div>
          </van-tab>

          <van-tab title="返校审批" name="return">
            <div class="tab-content">
              <van-loading v-if="loading" class="loading-center" size="24" />
              <div v-else-if="returnItems.length">
                <div
                  v-for="item in returnItems"
                  :key="item.id"
                  class="leave-card"
                  @click="goDetail(item, 'return')"
                >
                  <div class="leave-card__header">
                    <div class="leave-card__student">
                      <span class="student-avatar student-avatar--done">{{ (item.studentName || '?').charAt(0) }}</span>
                      <div>
                        <div class="student-name">{{ item.studentName }}</div>
                        <div class="student-id">{{ item.studentId || item.college || '' }}</div>
                      </div>
                    </div>
                    <span class="status-tag status-tag--pending">待审批</span>
                  </div>
                  <div class="leave-card__body">
                    <span class="info-badge info-badge--stage">返校申请</span>
                    <span class="info-badge info-badge--duration" v-if="item.duration">{{ item.duration }}天</span>
                    <span class="info-badge" v-if="item.returnType">{{ item.returnType === 'delay' ? '延期' : '正常' }}</span>
                  </div>
                  <div class="leave-card__footer">
                    <span class="current-approver">预计返校：{{ item.expected_return_date || item.newReturnDate || '—' }}</span>
                    <van-icon name="arrow" color="var(--color-text-muted)" />
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <div class="empty-state__icon">🏠</div>
                <div class="empty-state__text">暂无返校待审批</div>
              </div>
            </div>
          </van-tab>

          <van-tab title="超时未归" name="overdue">
            <div class="tab-content">
              <van-loading v-if="loading" class="loading-center" size="24" />
              <div v-else-if="overdueItems.length">
                <div
                  v-for="item in overdueItems"
                  :key="item.id"
                  class="leave-card leave-card--overdue"
                  @click="goDetail(item, 'leave')"
                >
                  <div class="leave-card__header">
                    <div class="leave-card__student">
                      <span class="student-avatar" style="background:#FEE2E2;color:#DC2626">{{ (item.studentName || '?').charAt(0) }}</span>
                      <div>
                        <div class="student-name">{{ item.studentName }}</div>
                        <div class="student-id">{{ item.studentId || item.college || '' }}</div>
                      </div>
                    </div>
                    <span class="status-tag status-tag--rejected">超时 {{ item.overdueDays || 0 }}天</span>
                  </div>
                  <div class="leave-card__body">
                    <span class="info-badge">{{ item.leaveType }}</span>
                    <span class="info-badge info-badge--duration">{{ item.duration }}天</span>
                    <span class="info-badge" :style="{ background: item.returnStatus === 'pending' ? '#D1FAE5' : '#FEE2E2', color: item.returnStatus === 'pending' ? '#059669' : '#DC2626' }">
                      {{ item.returnStatus === 'pending' ? '已申请返校' : '未申请返校' }}
                    </span>
                  </div>
                  <div class="leave-card__footer">
                    <span class="current-approver">应返日期：{{ item.expected_return_date || item.endDate || '—' }}</span>
                    <van-icon name="arrow" color="var(--color-text-muted)" />
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <div class="empty-state__icon">✅</div>
                <div class="empty-state__text">暂无超时未归学生</div>
              </div>
            </div>
          </van-tab>

          <van-tab title="已办历史" name="completed">
            <div class="tab-content">
              <van-loading v-if="loading" class="loading-center" size="24" />
              <div v-else-if="completedLeaves.length">
                <div
                  v-for="leave in completedLeaves"
                  :key="leave.id"
                  class="leave-card leave-card--completed"
                  @click="goDetail(leave)"
                >
                  <div class="leave-card__header">
                    <div class="leave-card__student">
                      <span class="student-avatar student-avatar--done">{{ (leave.studentName || '?').charAt(0) }}</span>
                      <div>
                        <div class="student-name">{{ leave.studentName }}</div>
                        <div class="student-id">{{ leave.studentId }}</div>
                      </div>
                    </div>
                    <span :class="'status-tag ' + statusClass(leave)">{{ statusText(leave) }}</span>
                  </div>
                  <div class="leave-card__body">
                    <span class="info-badge">{{ leave.leaveType }}</span>
                    <span class="info-badge info-badge--duration">{{ leave.duration }}天</span>
                    <span class="info-badge" v-if="leave.stage !== 'initial'">{{ stageText(leave) }}</span>
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <div class="empty-state__icon">📋</div>
                <div class="empty-state__text">暂无已处理单据</div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '@/stores/leave.js'
import { showToast } from 'vant'

const router = useRouter()
const leaveStore = useLeaveStore()
const activeTab = ref('leave')
const searchText = ref('')
const loading = ref(false)
const refreshing = ref(false)

// 分类型数据
const leaveApprovals = ref([])
const returnApprovals = ref([])
const overdueApprovals = ref([])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    // 分别加载三类审批数据
    const [leaveRes, returnRes, overdueRes] = await Promise.all([
      leaveStore.fetchApprovalsByType('leave', { page_size: 200 }),
      leaveStore.fetchApprovalsByType('return', { page_size: 200 }),
      leaveStore.fetchApprovalsByType('overdue', { page_size: 200 })
    ])
    leaveApprovals.value = leaveRes.list || []
    returnApprovals.value = returnRes.list || []
    overdueApprovals.value = overdueRes.list || []
  } catch (err) {
    showToast({ message: '加载失败: ' + err.message, icon: 'fail' })
  }
  loading.value = false
}

async function onRefresh() {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

function onTabChange(name) {
  if (name === 'leave') loadData()
}

// 请假审批条目（过滤非初始阶段的）
const pendingLeaves = computed(() =>
  leaveApprovals.value
    .filter(l => l.status === 'pending' || l.status === 'processing')
    .sort((a, b) => {
      const order = { critical: 0, urgent: 1, normal: 2 }
      return (order[a.urgency] || 3) - (order[b.urgency] || 3)
    })
)

const filteredLeaveItems = computed(() => {
  let list = pendingLeaves.value
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter(l =>
      (l.studentName || '').toLowerCase().includes(kw) ||
      (l.studentId || '').includes(kw)
    )
  }
  return list
})

// 返校审批条目
const returnItems = computed(() =>
  returnApprovals.value.filter(l => l.status === 'pending')
)

// 超时未归条目
const overdueItems = computed(() =>
  overdueApprovals.value.filter(l =>
    l.returnStatus === 'overdue' ||
    (l.status === 'approved' && l.returnStatus === 'none' && l.overdueDays > 0)
  )
)

const completedLeaves = computed(() =>
  leaveStore.leaves.filter(l => l.status === 'approved' || l.status === 'rejected')
)

function goDetail(item, type) {
  if (type) {
    router.push(`/admin/detail/${item.id}?type=${type}`)
  } else {
    router.push(`/admin/detail/${item.id}`)
  }
}

function urgencyClass(leave) {
  switch (leave.urgency) {
    case 'critical': return 'status-tag--rejected'
    case 'urgent': return 'status-tag--pending'
    default: return 'status-tag--processing'
  }
}
function urgencyText(leave) {
  switch (leave.urgency) {
    case 'critical': return '特急'
    case 'urgent': return '紧急'
    default: return '普通'
  }
}

function statusClass(leave) {
  return leave.status === 'approved' ? 'status-tag--approved' : 'status-tag--rejected'
}
function statusText(leave) {
  return leave.status === 'approved' ? '已通过' : '已拒绝'
}
function stageText(leave) {
  if (leave.stage === 'return') return '返校'
  if (leave.stage === 'delay') return '延期'
  return ''
}
</script>

<style scoped>
.list-page { padding-bottom: 20px; }
.stat-strip { display: flex; gap: 8px; padding: 12px 16px; }
.stat-chip {
  flex: 1; text-align: center; background: var(--color-bg-card); border-radius: var(--radius-sm);
  padding: 10px 4px; box-shadow: var(--shadow-sm);
}
.stat-chip__num { font-size: var(--font-size-2xl); font-weight: 700; display: block; }
.stat-chip__label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; display: block; }
.stat-chip--active .stat-chip__num { color: var(--color-primary); }
.stat-chip--done .stat-chip__num { color: var(--color-success); }
.tab-content { padding-top: 8px; }
.filter-bar { padding: 0 16px 8px; }
.filter-chips { display: flex; gap: 8px; padding: 4px 0 8px; overflow-x: auto; }
.filter-chip {
  flex-shrink: 0; padding: 4px 12px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);
  background: var(--color-bg-input); color: var(--color-text-secondary); cursor: pointer;
}
.filter-chip.active { background: var(--color-primary-lighter); color: var(--color-primary); font-weight: 600; }
.leave-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 14px 16px;
  margin: 8px 16px; box-shadow: var(--shadow-sm); cursor: pointer; transition: transform 0.15s;
}
.leave-card:active { transform: scale(0.98); }
.leave-card--completed { opacity: 0.85; }
.leave-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.leave-card__student { display: flex; align-items: center; gap: 10px; }
.student-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary-lighter);
  color: var(--color-primary); display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-md); font-weight: 700;
}
.student-avatar--done { background: var(--color-success-light); color: #059669; }
.student-name { font-size: var(--font-size-md); font-weight: 600; }
.student-id { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 1px; }
.leave-card__body { margin-bottom: 8px; }
.info-badge {
  display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);
  background: var(--color-primary-lighter); color: var(--color-primary); margin-right: 6px; margin-bottom: 6px;
}
.info-badge--duration { background: var(--color-warning-light); color: #D97706; }
.info-badge--step { background: var(--color-bg-input); color: var(--color-text-secondary); }
.info-badge--stage { background: #FEF3C7; color: #D97706; }
.leave-card__reason { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; }
.leave-card__footer { display: flex; justify-content: space-between; align-items: center; }
.current-approver { font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 500; }
.loading-center { display: flex; justify-content: center; padding: 40px; }
.empty-state { text-align: center; padding: 40px 20px; }
.empty-state__icon { font-size: 48px; margin-bottom: 12px; }
.empty-state__text { font-size: 15px; color: #999; }
</style>
