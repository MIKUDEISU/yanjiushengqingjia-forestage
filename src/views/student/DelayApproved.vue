<template>
  <div class="page-container">
    <header class="view-header">
      <h1>延期通过</h1>
    </header>

    <div class="page-content" v-if="leave">
      <div class="success-banner">
        <div class="success-banner__icon"></div>
        <div class="success-banner__title">延期返校申请已通过</div>
        <div class="success-banner__desc">请按新确定的时间返校</div>
      </div>

      <div class="content-card">
        <div class="section-title">延期确认信息</div>
        <div class="confirm-grid">
          <div class="confirm-item">
            <div class="confirm-label">学生</div>
            <div class="confirm-value">{{ leave.studentName }}</div>
          </div>
          <div class="confirm-item">
            <div class="confirm-label">原请假天数</div>
            <div class="confirm-value">{{ leave.duration }}天</div>
          </div>
          <div class="confirm-item">
            <div class="confirm-label">原结束日期</div>
            <div class="confirm-value">{{ leave.endDate }}</div>
          </div>
          <div class="confirm-item">
            <div class="confirm-label">延期后返校</div>
            <div class="confirm-value highlight">待确认新日期</div>
          </div>
          <div class="confirm-item">
            <div class="confirm-label">审批状态</div>
            <div class="confirm-value">
              <span class="status-tag status-tag--approved">延期已通过</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">后续安排</div>
        <div class="tips-list">
          <div class="tip-item">请在确定返校日期后联系辅导员更新信息</div>
          <div class="tip-item">提前与任课老师协商补课安排</div>
          <div class="tip-item">保持与辅导员每周至少一次联系</div>
        </div>
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
const leaveId = computed(() => parseInt(route.params.id))
const leave = computed(() => leaveStore.getLeaveById(leaveId.value))
</script>

<style scoped>
.page-content { padding-bottom: 40px; }
.success-banner { text-align: center; padding: 28px 16px; background: linear-gradient(135deg, #059669, #10B981); color: #fff; }
.success-banner__icon { font-size: 48px; }
.success-banner__title { font-size: var(--font-size-2xl); font-weight: 700; margin: 8px 0; }
.success-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.confirm-grid { display: flex; flex-direction: column; gap: 10px; }
.confirm-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border-light); }
.confirm-item:last-child { border-bottom: none; }
.confirm-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.confirm-value { font-size: var(--font-size-base); font-weight: 500; }
.confirm-value.highlight { color: var(--color-primary); font-weight: 600; }
.tips-list { display: flex; flex-direction: column; gap: 10px; }
.tip-item { font-size: var(--font-size-sm); color: var(--color-text-secondary); padding: 8px 0; border-bottom: 1px solid var(--color-border-light); }
.tip-item:last-child { border-bottom: none; }
</style>