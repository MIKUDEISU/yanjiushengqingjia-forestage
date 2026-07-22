<template>
  <div class="page-container">
    <header class="view-header">
      <h1>请假记录</h1>
    </header>

    <div class="history-page">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="stat-strip" v-if="leaves.length">
          <div class="stat-chip">
            <span class="stat-chip__num">{{ leaves.length }}</span>
            <span class="stat-chip__label">总计</span>
          </div>
          <div class="stat-chip stat-chip--active">
            <span class="stat-chip__num">{{ processingCount }}</span>
            <span class="stat-chip__label">进行中</span>
          </div>
          <div class="stat-chip stat-chip--done">
            <span class="stat-chip__num">{{ approvedCount }}</span>
            <span class="stat-chip__label">已通过</span>
          </div>
          <div class="stat-chip stat-chip--fail">
            <span class="stat-chip__num">{{ rejectedCount }}</span>
            <span class="stat-chip__label">已拒绝</span>
          </div>
        </div>

        <div v-if="leaves.length">
          <div
            v-for="leave in leaves"
            :key="leave.id"
            class="leave-card"
            @click="goToLeave(leave)"
          >
            <div class="leave-card__header">
              <div class="leave-card__type">
                <span class="type-text">{{ leave.leaveType }}</span>
                <span class="status-tag" :class="statusClass(leave)">
                  {{ statusText(leave) }}
                </span>
              </div>
              <div class="leave-card__duration">{{ leave.duration }}天</div>
            </div>
            <div class="leave-card__body">
              <div class="leave-card__dates">{{ leave.startDate }} ~ {{ leave.endDate }}</div>
              <div class="leave-card__reason">{{ leave.reason }}</div>
            </div>
            <div class="leave-card__footer">
              <div class="leave-card__stage" v-if="leave.stage !== 'initial'">
                <van-tag size="small" type="primary">{{ stageText(leave) }}</van-tag>
              </div>
              <div class="leave-card__action">
                <van-icon name="arrow" color="var(--color-text-muted)" />
              </div>
            </div>
          </div>
        </div>

        <van-loading v-if="loading" class="loading-center" size="24" />
        <div class="empty-state" v-if="!loading && !leaves.length">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__text">暂无请假记录</div>
          <van-button round type="primary" style="margin-top:16px;" @click="$router.push('/student/init')">去请假</van-button>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const router = useRouter()
const leaveStore = useLeaveStore()
const loading = ref(false)
const refreshing = ref(false)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  const result = await leaveStore.fetchLeaves({ pageSize: 100 })
  loading.value = false
  if (!result.success) {
    showToast({ message: result.message || '加载失败', icon: 'fail' })
  }
}

async function onRefresh() {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

const leaves = computed(() => leaveStore.leaves)

const processingCount = computed(() => leaves.value.filter(l => l.status === 'pending' || l.status === 'processing').length)
const approvedCount = computed(() => leaves.value.filter(l => l.status === 'approved').length)
const rejectedCount = computed(() => leaves.value.filter(l => l.status === 'rejected').length)

function statusClass(leave) {
  switch (leave.status) {
    case 'pending': return 'status-tag--pending'
    case 'processing': return 'status-tag--processing'
    case 'approved': return 'status-tag--approved'
    case 'rejected': return 'status-tag--rejected'
    default: return ''
  }
}

function statusText(leave) {
  switch (leave.status) {
    case 'pending': return '待审批'
    case 'processing': return '审批中'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
}

function stageText(leave) {
  if (leave.stage === 'return') return '返校阶段'
  if (leave.stage === 'delay') return '延期阶段'
  return ''
}

function goToLeave(leave) {
  if (leave.status === 'pending') {
    router.push('/student/init')
  } else if (leave.status === 'processing') {
    router.push(`/student/leave/${leave.id}/processing`)
  } else if (leave.status === 'rejected') {
    router.push(`/student/leave/${leave.id}/rejected`)
  } else if (leave.status === 'approved') {
    router.push(`/student/leave/${leave.id}/processing`)
  }
}
</script>

<style scoped>
.history-page { padding-bottom: 20px; }
.stat-strip { display: flex; gap: 8px; padding: 12px 16px; }
.stat-chip {
  flex: 1; text-align: center;
  background: var(--color-bg-card); border-radius: var(--radius-sm); padding: 10px 4px;
  box-shadow: var(--shadow-sm);
}
.stat-chip__num { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); display: block; }
.stat-chip__label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; display: block; }
.stat-chip--active .stat-chip__num { color: var(--color-primary); }
.stat-chip--done .stat-chip__num { color: var(--color-success); }
.stat-chip--fail .stat-chip__num { color: var(--color-danger); }
.leave-card {
  background: var(--color-bg-card); border-radius: var(--radius-md);
  padding: 14px 16px; margin: 8px 16px; box-shadow: var(--shadow-sm); cursor: pointer;
  transition: transform 0.15s;
}
.leave-card:active { transform: scale(0.98); }
.leave-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.leave-card__type { display: flex; align-items: center; gap: 8px; }
.type-text { font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-primary); }
.leave-card__duration { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-primary); }
.leave-card__body { margin-bottom: 8px; }
.leave-card__dates { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 4px; }
.leave-card__reason { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.leave-card__footer { display: flex; justify-content: space-between; align-items: center; }
.loading-center { display: flex; justify-content: center; padding: 40px; }
.empty-state { text-align: center; padding: 40px 20px; }
.empty-state__icon { font-size: 48px; margin-bottom: 12px; }
.empty-state__text { font-size: 15px; color: #999; }
</style>
