<template>
  <div class="page-container">
    <header class="view-header">
      <h1>延期未通过</h1>
    </header>

    <div class="page-content" v-if="leave">
      <div class="error-banner">
        <div class="error-banner__icon"></div>
        <div class="error-banner__title">延期返校申请被驳回</div>
        <div class="error-banner__desc">请按原计划时间返校</div>
      </div>

      <div class="content-card">
        <div class="section-title">驳回原因</div>
        <div class="reason-box">
          <van-icon name="warning-o" color="#EF4444" size="20" />
          <div class="reason-text">{{ leave.rejectReason }}</div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">需恢复的原计划</div>
        <div class="info-row"><div class="info-row__label">原返校日</div><div class="info-row__value highlight">{{ leave.endDate }}</div></div>
        <div class="info-row"><div class="info-row__label">请假天数</div><div class="info-row__value">{{ leave.duration }}天</div></div>
        <div class="info-row"><div class="info-row__label">提醒</div><div class="info-row__value warn-text">延期被驳回，必须按原定日期返校</div></div>
      </div>

      <div class="action-bar">
        <van-button round block type="primary" @click="$router.push('/student/history')">返回记录列表</van-button>
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
.error-banner { text-align: center; padding: 28px 16px; background: linear-gradient(135deg, #EA580C, #F97316); color: #fff; }
.error-banner__icon { font-size: 48px; }
.error-banner__title { font-size: var(--font-size-2xl); font-weight: 700; margin: 8px 0; }
.error-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.reason-box { display: flex; align-items: flex-start; gap: 10px; background: var(--color-danger-light); border-radius: var(--radius-sm); padding: 14px; }
.reason-text { font-size: var(--font-size-base); color: #991B1B; line-height: 1.6; }
.action-bar { padding: 16px; }
.highlight { color: var(--color-primary); font-weight: 600; }
.warn-text { color: var(--color-danger); font-weight: 500; }
</style>