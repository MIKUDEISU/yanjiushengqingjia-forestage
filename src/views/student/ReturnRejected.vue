<template>
  <div class="page-container">
    <header class="view-header">
      <h1>返校未通过</h1>
    </header>

    <div class="page-content" v-if="leave">
      <div class="error-banner">
        <div class="error-banner__icon"></div>
        <div class="error-banner__title">返校申请被拒绝</div>
        <div class="error-banner__desc">请查看原因，修正后可重新提交</div>
      </div>

      <div class="content-card">
        <div class="section-title">拒绝原因</div>
        <div class="reason-box">
          <van-icon name="warning-o" color="#EF4444" size="20" />
          <div class="reason-text">{{ leave.rejectReason }}</div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">原请假信息</div>
        <div class="info-row"><div class="info-row__label">请假类型</div><div class="info-row__value">{{ leave.leaveType }}</div></div>
        <div class="info-row"><div class="info-row__label">时长</div><div class="info-row__value">{{ leave.duration }}天</div></div>
        <div class="info-row"><div class="info-row__label">起止</div><div class="info-row__value">{{ leave.startDate }} ~ {{ leave.endDate }}</div></div>
      </div>

      <div class="action-bar">
        <van-button round block type="primary" @click="retry">重新提交返校申请</van-button>
        <van-button round block plain type="default" style="margin-top:10px;" @click="$router.push('/student/history')">返回记录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const route = useRoute()
const router = useRouter()
const leaveStore = useLeaveStore()
const leaveId = computed(() => parseInt(route.params.id))
const leave = computed(() => leaveStore.getLeaveById(leaveId.value))

function retry() {
  if (leave.value) {
    leaveStore.applyReturn(leave.value.id)
    showToast('已重新提交返校申请')
    router.push(`/student/leave/${leave.value.id}/return/processing`)
  }
}
</script>

<style scoped>
.page-content { padding-bottom: 40px; }
.error-banner {
  text-align: center; padding: 28px 16px;
  background: linear-gradient(135deg, #DC2626, #EF4444); color: #fff;
}
.error-banner__icon { font-size: 48px; }
.error-banner__title { font-size: var(--font-size-2xl); font-weight: 700; margin: 8px 0; }
.error-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.reason-box { display: flex; align-items: flex-start; gap: 10px; background: var(--color-danger-light); border-radius: var(--radius-sm); padding: 14px; }
.reason-text { font-size: var(--font-size-base); color: #991B1B; line-height: 1.6; }
.action-bar { padding: 16px; }
</style>