<template>
  <div class="page-container">
    <header class="view-header">
      <h1>审批结果</h1>
    </header>

    <div class="rejected-page" v-if="leave">
      <!-- 拒绝横幅 -->
      <div class="status-banner status-banner--error">
        <div class="status-banner__icon"></div>
        <div class="status-banner__text">
          <div class="status-banner__title">请假申请被拒绝</div>
          <div class="status-banner__desc">请查看拒绝原因并修改后重新提交</div>
        </div>
      </div>

      <!-- 拒绝原因 -->
      <div class="content-card">
        <div class="section-title">拒绝原因</div>
        <div class="reason-box">
          <van-icon name="warning-o" color="#EF4444" size="20" />
          <div class="reason-text">{{ leave.rejectReason }}</div>
        </div>
      </div>

      <!-- 原请假信息 -->
      <div class="content-card">
        <div class="section-title">原始请假信息</div>
        <div class="info-row">
          <div class="info-row__label">请假类型</div>
          <div class="info-row__value">{{ leave.leaveType }}</div>
        </div>
        <div class="info-row">
          <div class="info-row__label">时长</div>
          <div class="info-row__value">{{ leave.duration }}天</div>
        </div>
        <div class="info-row">
          <div class="info-row__label">起止日期</div>
          <div class="info-row__value">{{ leave.startDate }} ~ {{ leave.endDate }}</div>
        </div>
        <div class="info-row">
          <div class="info-row__label">请假原因</div>
          <div class="info-row__value">{{ leave.reason }}</div>
        </div>
      </div>

      <!-- 审批时间轴 -->
      <div class="content-card">
        <div class="section-title">审批记录</div>
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

      <!-- 操作 -->
      <div class="action-bar">
        <van-button round block type="primary" @click="resubmit">
          修改并重新提交
        </van-button>
        <van-button round block plain type="default" style="margin-top: 10px;" @click="$router.push('/student/history')">
          查看所有记录
        </van-button>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-state__icon"></div>
      <div class="empty-state__text">未找到该请假记录</div>
      <van-button round type="primary" style="margin-top:16px;" @click="$router.push('/student/history')">返回列表</van-button>
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

function resubmit() {
  router.push('/student/init')
  showToast('请修改信息后重新提交')
}
</script>

<style scoped>
.rejected-page { padding-bottom: 40px; }
.status-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 16px; color: #fff;
  background: linear-gradient(135deg, var(--color-danger), #DC2626);
}
.status-banner--error .status-banner__title { font-size: var(--font-size-xl); font-weight: 700; }
.status-banner--error .status-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.reason-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--color-danger-light); border-radius: var(--radius-sm); padding: 14px;
}
.reason-text { font-size: var(--font-size-base); color: #991B1B; line-height: 1.6; }
.timeline { position: relative; padding-left: 8px; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.timeline-item:not(:last-child)::after {
  content: ''; position: absolute; left: 8px; top: 24px;
  width: 2px; height: calc(100% - 8px); background: var(--color-border);
}
.timeline-dot { width: 18px; height: 18px; min-width: 18px; border-radius: 50%; background: var(--color-success); z-index: 1; }
.timeline-dot--error { background: var(--color-danger); }
.timeline-dot--processing { background: var(--color-primary); }
.timeline-content { flex: 1; }
.timeline-title { font-size: var(--font-size-md); font-weight: 600; }
.timeline-desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 2px 0; }
.timeline-time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.timeline-item--error .timeline-title { color: var(--color-danger); }
.action-bar { padding: 16px; }
</style>