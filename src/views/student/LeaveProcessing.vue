<template>
  <div class="page-container">
    <header class="view-header"><h1>审批进度</h1></header>

    <div class="processing-page">
      <div class="status-banner" :class="bannerClass" v-if="leave">
        <div class="status-banner__icon">{{ bannerIcon }}</div>
        <div class="status-banner__text">
          <div class="status-banner__title">{{ bannerTitle }}</div>
          <div class="status-banner__desc" v-if="leave.status === 'processing' || leave.status === 'pending'">
            当前审批人：<strong>{{ leave.currentApprover || '—' }}</strong>
          </div>
          <div class="status-banner__desc" v-else-if="leave.status === 'rejected'">
            拒绝原因：<strong>{{ leave.rejectReason || '—' }}</strong>
          </div>
          <div class="status-banner__desc" v-else-if="leave.status === 'approved'">
            请假已通过，{{ leave.stage === 'initial' ? '可申请返校或延期' : leave.stage === 'return' ? '返校流程进行中' : '延期流程进行中' }}
          </div>
        </div>
      </div>

      <div class="content-card" v-if="leave && (leave.status === 'pending' || leave.status === 'processing')">
        <div class="section-title">审批进度</div>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div
              class="progress-bar__fill"
              :style="{ width: ((leave.currentStep || 0) / (leave.totalSteps || 1)) * 100 + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            第 {{ leave.currentStep || 0 }} / {{ leave.totalSteps || 1 }} 级审批
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">审批时间轴</div>
        <div class="timeline">
          <div
            v-for="(item, index) in (leave?.timeline || [])"
            :key="index"
            class="timeline-item"
            :class="{ 'timeline-item--error': item.status === 'error' }"
          >
            <div class="timeline-dot" :class="'timeline-dot--' + (item.status || 'done')"></div>
            <div class="timeline-content">
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-desc">{{ item.desc }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card" v-if="leave">
        <div class="section-title">请假信息摘要</div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">请假类型</div>
            <div class="summary-value">{{ leave.leaveType }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">时长</div>
            <div class="summary-value">{{ leave.duration }}天</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">起止</div>
            <div class="summary-value">{{ leave.startDate }} ~ {{ leave.endDate }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">状态</div>
            <div class="summary-value">
              <span class="status-tag" :class="statusTagClass">{{ statusTagText }}</span>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">是否离开西安</div>
            <div class="summary-value">{{ leave.leavingXiAn ? '是' : '否' }}</div>
          </div>
          <div class="summary-item" v-if="leave.leavingXiAn">
            <div class="summary-label">离校目的地</div>
            <div class="summary-value">{{ leave.destination }}</div>
          </div>
        </div>
      </div>

      <div class="action-bar" v-if="leave">
        <template v-if="leave.status === 'approved' && leave.stage === 'initial'">
          <van-button round block type="primary" @click="handleApplyReturn" class="follow-btn">
            申请返校
          </van-button>
          <van-button round block plain type="primary" @click="handleApplyDelay" class="follow-btn">
            申请延期返校
          </van-button>
        </template>

        <template v-else-if="leave.status === 'approved' && leave.stage === 'return'">
          <template v-if="leave.returnStatus === 'processing'">
            <div class="action-note">返校审批进行中，请耐心等待</div>
          </template>
          <template v-else-if="leave.returnStatus === 'approved'">
            <van-button round block type="primary" @click="$router.push(`/student/leave/${leave.id}/return/approved`)">
              查看返校凭证
            </van-button>
          </template>
          <template v-else-if="leave.returnStatus === 'rejected'">
            <van-button round block type="danger" @click="$router.push(`/student/leave/${leave.id}/return/rejected`)">
              查看返校拒绝详情
            </van-button>
          </template>
        </template>

        <template v-else-if="leave.status === 'approved' && leave.stage === 'delay'">
          <template v-if="leave.delayStatus === 'processing'">
            <div class="action-note">延期审批进行中，请耐心等待</div>
          </template>
          <template v-else-if="leave.delayStatus === 'approved'">
            <van-button round block type="primary" @click="$router.push(`/student/leave/${leave.id}/delay/approved`)">
              查看延期确认
            </van-button>
          </template>
          <template v-else-if="leave.delayStatus === 'rejected'">
            <van-button round block type="warning" @click="$router.push(`/student/leave/${leave.id}/delay/rejected`)">
              查看延期驳回详情
            </van-button>
          </template>
        </template>

        <template v-else-if="leave.status === 'rejected'">
          <van-button round block type="primary" @click="$router.push(`/student/leave/${leave.id}/rejected`)">
            查看拒绝原因并重新提交
          </van-button>
        </template>

        <template v-else>
          <div class="action-note">审批完成后将通过系统消息和短信通知您</div>
        </template>

        <van-button round block plain type="default" style="margin-top: 10px;" @click="$router.push('/student/history')">
          查看所有请假记录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const route = useRoute()
const router = useRouter()
const leaveStore = useLeaveStore()

const leaveId = computed(() => parseInt(route.params.id))
const leave = computed(() => leaveStore.getLeaveById(leaveId.value))

const bannerClass = computed(() => {
  if (!leave.value) return ''
  switch (leave.value.status) {
    case 'approved': return 'status-banner--success'
    case 'rejected': return 'status-banner--error'
    default: return ''
  }
})

const bannerIcon = computed(() => {
  if (!leave.value) return ''
  switch (leave.value.status) {
    case 'approved': return 'V'
    case 'rejected': return 'X'
    default: return ''
  }
})

const bannerTitle = computed(() => {
  if (!leave.value) return '—'
  switch (leave.value.status) {
    case 'approved': return '请假已通过'
    case 'rejected': return '请假被拒绝'
    case 'pending': return '请假待提交'
    default: return '请假审批进行中'
  }
})

const statusTagClass = computed(() => {
  if (!leave.value) return ''
  switch (leave.value.status) {
    case 'pending': return 'status-tag--pending'
    case 'processing': return 'status-tag--processing'
    case 'approved': return 'status-tag--approved'
    case 'rejected': return 'status-tag--rejected'
    default: return ''
  }
})

const statusTagText = computed(() => {
  if (!leave.value) return ''
  switch (leave.value.status) {
    case 'pending': return '待提交'
    case 'processing': return '审批中'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
})

function handleApplyReturn() {
  if (!leave.value) return
  leaveStore.applyReturn(leave.value.id)
  showSuccessToast('已发起返校申请')
  router.push(`/student/leave/${leave.value.id}/return/processing`)
}

function handleApplyDelay() {
  if (!leave.value) return
  leaveStore.applyDelay(leave.value.id, 5)
  showSuccessToast('已发起延期返校申请')
  router.push(`/student/leave/${leave.value.id}/delay/processing`)
}
</script>

<style scoped>
.processing-page { padding-bottom: 40px; }
.status-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, var(--color-primary), #4F46E5);
  color: #fff;
  padding: 20px 16px;
  margin: 0 0 12px 0;
}
.status-banner__icon { font-size: 40px; }
.status-banner__title { font-size: var(--font-size-xl); font-weight: 700; margin-bottom: 4px; }
.status-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.status-banner--success { background: linear-gradient(135deg, #10B981, #059669); }
.status-banner--error { background: linear-gradient(135deg, #EF4444, #DC2626); }
.follow-btn { margin-top: 10px; }
.progress-wrapper { padding: 8px 0; }
.progress-bar { height: 8px; background: var(--color-border-light); border-radius: 4px; overflow: hidden; }
.progress-bar__fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #4F46E5); border-radius: 4px; transition: width 0.6s ease; }
.progress-text { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 8px; text-align: right; }
.timeline { position: relative; padding-left: 8px; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 8px; top: 24px;
  width: 2px;
  height: calc(100% - 8px);
  background: var(--color-border);
}
.timeline-dot {
  width: 18px; height: 18px; min-width: 18px;
  border-radius: 50%;
  background: var(--color-success);
  z-index: 1;
}
.timeline-dot--processing { background: var(--color-primary); animation: pulse 1.5s infinite; }
.timeline-dot--pending { background: var(--color-border); }
.timeline-dot--error { background: var(--color-danger); }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 0 6px rgba(37,99,235,0); } }
.timeline-item--error .timeline-title { color: var(--color-danger); }
.timeline-content { flex: 1; padding-bottom: 4px; }
.timeline-title { font-size: var(--font-size-md); font-weight: 600; margin-bottom: 2px; }
.timeline-desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 2px; }
.timeline-time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.summary-item { padding: 10px; background: var(--color-bg); border-radius: var(--radius-sm); }
.summary-label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: 4px; }
.summary-value { font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-primary); }
.action-bar { padding: 16px; text-align: center; }
.action-note { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 12px; }
</style>