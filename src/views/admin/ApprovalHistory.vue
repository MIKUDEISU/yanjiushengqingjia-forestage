<template>
  <div class="page-container">
    <header class="view-header"><h1>审批记录</h1></header>

    <div class="history-page">
      <div class="stat-strip" v-if="completed.length">
        <div class="stat-chip stat-chip--done">
          <span class="stat-chip__num">{{ approvedCount }}</span>
          <span class="stat-chip__label">已通过</span>
        </div>
        <div class="stat-chip stat-chip--fail">
          <span class="stat-chip__num">{{ rejectedCount }}</span>
          <span class="stat-chip__label">已拒绝</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__num">{{ smsSentCount }}</span>
          <span class="stat-chip__label">已发短信</span>
        </div>
      </div>

      <div v-if="completed.length">
        <div
          v-for="leave in completed"
          :key="leave.id"
          class="history-card"
          @click="$router.push(`/admin/detail/${leave.id}`)"
        >
          <div class="history-card__left">
            <div class="history-card__name">{{ leave.studentName }}</div>
            <div class="history-card__meta">{{ leave.studentId }} | {{ leave.className }}</div>
            <div class="history-card__info">
              <span class="info-badge">{{ leave.leaveType }}</span>
              <span class="info-badge info-badge--duration">{{ leave.duration }}天</span>
            </div>
          </div>
          <div class="history-card__right">
            <div :class="'status-tag ' + statusClass(leave)">{{ statusText(leave) }}</div>
            <div class="history-card__sms" v-if="leave.smsSent">
              <van-icon name="envelope-o" size="12" color="#10B981" /> 已通知
            </div>
            <div class="history-card__time">{{ leave.timeline.slice(-1)[0]?.time?.split(' ')[0] || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">暂无已处理的审批记录</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '@/stores/leave.js'

const router = useRouter()
const leaveStore = useLeaveStore()

const completed = computed(() =>
  leaveStore.leaves
    .filter(l => l.status === 'approved' || l.status === 'rejected')
    .sort((a, b) => b.id - a.id)
)

const approvedCount = computed(() => completed.value.filter(l => l.status === 'approved').length)
const rejectedCount = computed(() => completed.value.filter(l => l.status === 'rejected').length)
const smsSentCount = computed(() => completed.value.filter(l => l.smsSent).length)

function statusClass(leave) {
  return leave.status === 'approved' ? 'status-tag--approved' : 'status-tag--rejected'
}
function statusText(leave) {
  return leave.status === 'approved' ? '已通过' : '已拒绝'
}
</script>

<style scoped>
.history-page { padding-bottom: 20px; }
.stat-strip { display: flex; gap: 8px; padding: 12px 16px; }
.stat-chip {
  flex: 1; text-align: center; background: var(--color-bg-card); border-radius: var(--radius-sm);
  padding: 10px 4px; box-shadow: var(--shadow-sm);
}
.stat-chip__num { font-size: var(--font-size-2xl); font-weight: 700; display: block; }
.stat-chip__label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; display: block; }
.stat-chip--done .stat-chip__num { color: var(--color-success); }
.stat-chip--fail .stat-chip__num { color: var(--color-danger); }
.history-card {
  display: flex; justify-content: space-between;
  background: var(--color-bg-card); border-radius: var(--radius-md);
  padding: 14px 16px; margin: 8px 16px; box-shadow: var(--shadow-sm);
  cursor: pointer; transition: transform 0.15s;
}
.history-card:active { transform: scale(0.98); }
.history-card__left { flex: 1; }
.history-card__name { font-size: var(--font-size-md); font-weight: 600; }
.history-card__meta { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 2px 0 6px; }
.info-badge {
  display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);
  background: var(--color-primary-lighter); color: var(--color-primary); margin-right: 6px;
}
.info-badge--duration { background: var(--color-warning-light); color: #D97706; }
.history-card__right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.history-card__sms { font-size: var(--font-size-xs); color: var(--color-success); display: flex; align-items: center; gap: 4px; }
.history-card__time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
</style>