<template>
  <div class="page-container">
    <header class="view-header">
      <h1>延期审批中</h1>
    </header>

    <div class="page-content" v-if="leave">
      <div class="info-banner">
        <div class="info-banner__icon"></div>
        <div class="info-banner__title">延期返校申请进行中</div>
        <div class="info-banner__desc">审批人：<strong>{{ leave.currentApprover || '—' }}</strong></div>
      </div>

      <div class="content-card">
        <div class="section-title">延期概况</div>
        <div class="summary-grid">
          <div class="summary-item"><div class="summary-label">学生</div><div class="summary-value">{{ leave.studentName }}</div></div>
          <div class="summary-item"><div class="summary-label">原请假天数</div><div class="summary-value">{{ leave.duration }}天</div></div>
          <div class="summary-item"><div class="summary-label">原结束日期</div><div class="summary-value">{{ leave.endDate }}</div></div>
          <div class="summary-item"><div class="summary-label">延期状态</div><div class="summary-value"><span class="status-tag status-tag--processing">审核中</span></div></div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">审批时间轴</div>
        <div class="timeline">
          <div v-for="(item, index) in leave.timeline" :key="index" class="timeline-item" :class="{ 'timeline-item--error': item.status === 'error' }">
            <div class="timeline-dot" :class="'timeline-dot--' + (item.status || 'done')"></div>
            <div class="timeline-content">
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-desc">{{ item.desc }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <div class="action-note">延期审批完成后将通过消息通知您</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLeaveStore } from '@/stores/leave.js'
const route = useRoute()
const leaveStore = useLeaveStore()
const leaveId = computed(() => route.params.id)
const leave = computed(() => leaveStore.getLeaveById(leaveId.value))
</script>

<style scoped>
.page-content { padding-bottom: 40px; }
.info-banner { display: flex; align-items: center; gap: 14px; padding: 20px 16px; color: #fff; background: linear-gradient(135deg, #7C3AED, #A78BFA); }
.info-banner__icon { font-size: 40px; }
.info-banner__title { font-size: var(--font-size-xl); font-weight: 700; }
.info-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.summary-item { padding: 10px; background: var(--color-bg); border-radius: var(--radius-sm); }
.summary-label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: 4px; }
.summary-value { font-size: var(--font-size-md); font-weight: 600; }
.timeline { position: relative; padding-left: 8px; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 8px; top: 24px; width: 2px; height: calc(100% - 8px); background: var(--color-border); }
.timeline-dot { width: 18px; height: 18px; min-width: 18px; border-radius: 50%; background: var(--color-success); z-index: 1; }
.timeline-dot--processing { background: var(--color-primary); animation: pulse 1.5s infinite; }
.timeline-dot--error { background: var(--color-danger); }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 0 6px rgba(37,99,235,0); } }
.timeline-content { flex: 1; }
.timeline-title { font-size: var(--font-size-md); font-weight: 600; }
.timeline-desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 2px 0; }
.timeline-time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.timeline-item--error .timeline-title { color: var(--color-danger); }
.action-bar { padding: 16px; text-align: center; }
.action-note { font-size: var(--font-size-xs); color: var(--color-text-muted); }
</style>