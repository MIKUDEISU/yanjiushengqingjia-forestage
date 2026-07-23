<template>
  <div class="page-container">
    <header class="view-header"><h1>审批详情</h1></header>

    <van-loading v-if="loading" class="loading-center" size="24" text="加载中..." />

    <div class="detail-page" v-else-if="leave">
      <div class="student-card">
        <div class="student-card__avatar">{{ leave.studentName.charAt(0) }}</div>
        <div class="student-card__info">
          <div class="student-card__name">{{ leave.studentName }}</div>
          <div class="student-card__meta">{{ leave.studentId }} | {{ leave.className }}</div>
        </div>
        <div :class="'status-tag ' + statusClass">{{ statusText }}</div>
      </div>

      <div class="content-card">
        <div class="section-title">请假信息</div>
        <div class="info-row">
          <div class="info-row__label">请假类型</div>
          <div class="info-row__value"><van-tag type="primary" size="medium">{{ leave.leaveType }}</van-tag></div>
        </div>
        <div class="info-row">
          <div class="info-row__label">请假天数</div>
          <div class="info-row__value highlight">{{ leave.duration }} 天</div>
        </div>
        <div class="info-row">
          <div class="info-row__label">起止时间</div>
          <div class="info-row__value">{{ leave.startDate }} ~ {{ leave.endDate }}</div>
        </div>
        <div class="info-row">
          <div class="info-row__label">紧急程度</div>
          <div class="info-row__value"><span :class="'status-tag ' + urgencyClass">{{ urgencyText }}</span></div>
        </div>
        <div class="info-row" v-if="leave.leavingXiAn">
          <div class="info-row__label">离校目的地</div>
          <div class="info-row__value highlight">{{ leave.destination }}</div>
        </div>
        <div class="reason-box">{{ leave.reason }}</div>
      </div>

      <div class="content-card" v-if="leave.timeline && leave.timeline.length">
        <div class="section-title">审批流转记录</div>
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

      <div class="content-card" v-if="isPendingApproval(leave)">
        <div class="section-title">{{ approvalSectionTitle }}</div>
        <div class="sms-toggle">
          <div class="sms-toggle__label">
            <van-icon name="phone-o" size="18" color="#2563EB" />
            <span>通知学生家长（发送短信）</span>
          </div>
          <van-switch v-model="smsEnabled" active-color="#2563EB" size="22" />
        </div>
        <div class="reason-input" v-if="actionType === 'reject' || actionType === 'return'">
          <van-field v-model="actionReason" type="textarea" rows="3" :placeholder="actionType === 'reject' ? rejectPlaceholder : '请输入驳回修改意见...'" />
        </div>
        <div class="action-buttons">
          <van-button v-if="actionType === 'approve'" round block type="primary" class="action-btn" @click="handleApprove" :loading="submitting">
            <van-icon name="checked" /> {{ approveBtnText }}
          </van-button>
          <van-button v-if="actionType === 'reject'" round block type="danger" class="action-btn" @click="handleReject" :loading="submitting">
            <van-icon name="close" /> {{ rejectBtnText }}
          </van-button>
          <van-button v-if="actionType === 'return'" round block type="warning" class="action-btn" @click="handleReturn" :loading="submitting">
            <van-icon name="revoke" /> 驳回修改
          </van-button>
        </div>
        <div class="action-switcher" v-if="!isSubApproval">
          <span :class="{ active: actionType === 'approve' }" @click="actionType = 'approve'; actionReason = ''">同意</span>
          <span :class="{ active: actionType === 'reject' }" @click="actionType = 'reject'">拒绝</span>
          <span :class="{ active: actionType === 'return' }" @click="actionType = 'return'">驳回</span>
        </div>
        <div class="action-switcher" v-else>
          <span :class="{ active: actionType === 'approve' }" @click="actionType = 'approve'; actionReason = ''">同意</span>
          <span :class="{ active: actionType === 'reject' }" @click="actionType = 'reject'">拒绝</span>
        </div>
      </div>

      <div class="content-card" v-if="!isPendingApproval(leave)">
        <div class="section-title">审批结果</div>
        <div class="result-box" :class="resultBoxClass">
          <div class="result-icon">{{ resultIcon }}</div>
          <div class="result-text">
            <div class="result-title">{{ resultTitle }}</div>
            <div class="result-desc" v-if="resultSubText">{{ resultSubText }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <div class="empty-state__icon">📋</div>
      <div class="empty-state__text">未找到该请假单</div>
      <van-button round type="primary" style="margin-top:16px;" @click="$router.back()">返回列表</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const route = useRoute()
const router = useRouter()
const leaveStore = useLeaveStore()
const loading = ref(true)
const leave = ref(null)
const smsEnabled = ref(false)
const actionType = ref('approve')
const actionReason = ref('')
const submitting = ref(false)

onMounted(async () => {
  const id = route.params.id
  const type = route.query.type || 'leave'
  let result
  if (type === 'leave') {
    result = await leaveStore.fetchApprovalDetail('leave', id)
  } else {
    result = await leaveStore.fetchApprovalDetail(type, id)
  }
  loading.value = false
  if (result.success) {
    leave.value = result.data
  } else {
    showToast({ message: result.message || '加载详情失败', icon: 'fail' })
  }
})

function isPendingApproval(l) {
  if (!l) return false
  return leaveStore.isPendingApproval(l)
}

const isSubApproval = computed(() => {
  if (!leave.value) return false
  return leave.value.status === 'approved' &&
    (leave.value.stage === 'return' || leave.value.stage === 'delay') &&
    (leave.value.returnStatus === 'processing' || leave.value.delayStatus === 'processing')
})

const approvalSectionTitle = computed(() => {
  if (!leave.value) return '审批操作'
  if (leave.value.stage === 'return') return '返校审批'
  if (leave.value.stage === 'delay') return '延期审批'
  return '审批操作'
})

const approveBtnText = computed(() => {
  if (leave.value?.stage === 'return') return '同意返校'
  if (leave.value?.stage === 'delay') return '同意延期'
  return '同意请假'
})

const rejectBtnText = computed(() => {
  if (leave.value?.stage === 'return') return '拒绝返校'
  if (leave.value?.stage === 'delay') return '驳回延期'
  return '拒绝请假'
})

const rejectPlaceholder = computed(() => {
  if (leave.value?.stage === 'return') return '请输入拒绝返校原因...'
  if (leave.value?.stage === 'delay') return '请输入驳回延期原因...'
  return '请输入拒绝原因...'
})

const statusClass = computed(() => {
  if (!leave.value) return ''
  if (leave.value.status === 'approved') {
    if ((leave.value.stage === 'return' && leave.value.returnStatus === 'processing') ||
        (leave.value.stage === 'delay' && leave.value.delayStatus === 'processing')) return 'status-tag--processing'
    return 'status-tag--approved'
  }
  switch (leave.value.status) {
    case 'pending': return 'status-tag--pending'
    case 'processing': return 'status-tag--processing'
    case 'rejected': return 'status-tag--rejected'
    default: return ''
  }
})

const statusText = computed(() => {
  if (!leave.value) return '未知'
  if (leave.value.status === 'approved') {
    if (leave.value.stage === 'return' && leave.value.returnStatus === 'processing') return '返校审批中'
    if (leave.value.stage === 'delay' && leave.value.delayStatus === 'processing') return '延期审批中'
    return '已通过'
  }
  switch (leave.value.status) {
    case 'pending': return '待处理'
    case 'processing': return '审批中'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
})

const urgencyClass = computed(() => {
  switch (leave.value?.urgency) {
    case 'critical': return 'status-tag--rejected'
    case 'urgent': return 'status-tag--pending'
    default: return 'status-tag--processing'
  }
})

const urgencyText = computed(() => {
  switch (leave.value?.urgency) {
    case 'critical': return '特急'
    case 'urgent': return '紧急'
    default: return '普通'
  }
})

const resultBoxClass = computed(() => {
  if (!leave.value) return ''
  if (leave.value.status === 'approved') return 'result-box--success'
  if (leave.value.status === 'rejected') return 'result-box--error'
  return ''
})

const resultIcon = computed(() => {
  if (!leave.value) return ''
  return leave.value.status === 'approved' ? 'V' : 'X'
})

const resultTitle = computed(() => {
  if (!leave.value) return ''
  if (leave.value.status === 'rejected') return '已审批拒绝'
  if (leave.value.status === 'approved') return '已审批通过'
  return ''
})

const resultSubText = computed(() => {
  if (!leave.value) return ''
  if (leave.value.status === 'rejected') return leave.value.rejectReason
  return ''
})

async function handleApprove() {
  if (!leave.value) return
  submitting.value = true
  let result
  if (leave.value.stage === 'return') {
    result = await leaveStore.approveReturn(leave.value.id, smsEnabled.value)
  } else if (leave.value.stage === 'delay') {
    result = await leaveStore.approveDelay(leave.value.id, smsEnabled.value)
  } else {
    result = await leaveStore.approveLeave(leave.value.id, smsEnabled.value)
  }
  submitting.value = false
  if (result.success) {
    showSuccessToast('审批通过！')
    leave.value = result.data
  } else {
    showToast({ message: result.message || '操作失败', icon: 'fail' })
  }
}

async function handleReject() {
  if (!leave.value) return
  if (!actionReason.value.trim()) {
    showToast(rejectPlaceholder.value)
    return
  }
  submitting.value = true
  let result
  if (leave.value.stage === 'return') {
    result = await leaveStore.rejectReturn(leave.value.id, actionReason.value, smsEnabled.value)
  } else if (leave.value.stage === 'delay') {
    result = await leaveStore.rejectDelay(leave.value.id, actionReason.value, smsEnabled.value)
  } else {
    result = await leaveStore.rejectLeave(leave.value.id, actionReason.value, smsEnabled.value)
  }
  submitting.value = false
  if (result.success) {
    showSuccessToast('已拒绝')
    leave.value = result.data
  } else {
    showToast({ message: result.message || '操作失败', icon: 'fail' })
  }
}

async function handleReturn() {
  if (!leave.value) return
  if (!actionReason.value.trim()) {
    showToast('请输入驳回理由')
    return
  }
  submitting.value = true
  const result = await leaveStore.returnBackLeave(leave.value.id, actionReason.value, smsEnabled.value)
  submitting.value = false
  if (result.success) {
    showSuccessToast('已驳回该申请')
    leave.value = result.data
  } else {
    showToast({ message: result.message || '操作失败', icon: 'fail' })
  }
}
</script>

<style scoped>
.detail-page { padding-bottom: 40px; }
.loading-center { display: flex; justify-content: center; padding: 80px 0; }
.student-card {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
}
.student-card__avatar {
  width: 48px; height: 48px; min-width: 48px;
  border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), #4F46E5);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-2xl); font-weight: 700;
}
.student-card__info { flex: 1; }
.student-card__name { font-size: var(--font-size-lg); font-weight: 700; }
.student-card__meta { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }
.highlight { color: var(--color-primary); font-weight: 600; }
.reason-box { background: var(--color-bg); border-radius: var(--radius-sm); padding: 12px; margin-top: 4px; font-size: var(--font-size-base); line-height: 1.7; }
.timeline { position: relative; padding-left: 8px; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.timeline-item:not(:last-child)::after {
  content: ''; position: absolute; left: 8px; top: 24px;
  width: 2px; height: calc(100% - 8px); background: var(--color-border);
}
.timeline-dot { width: 18px; height: 18px; min-width: 18px; border-radius: 50%; background: var(--color-success); z-index: 1; }
.timeline-dot--processing { background: var(--color-primary); animation: pulse 1.5s infinite; }
.timeline-dot--error { background: var(--color-danger); }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 0 6px rgba(37,99,235,0); } }
.timeline-content { flex: 1; }
.timeline-title { font-size: var(--font-size-md); font-weight: 600; }
.timeline-desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 2px 0; }
.timeline-time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.timeline-item--error .timeline-title { color: var(--color-danger); }
.sms-toggle { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-border-light); }
.sms-toggle__label { display: flex; align-items: center; gap: 8px; font-size: var(--font-size-base); }
.reason-input { margin-top: 12px; }
.reason-input :deep(.van-field) { background: var(--color-bg-input); border-radius: var(--radius-sm); }
.action-buttons { margin-top: 16px; }
.action-btn { margin-top: 8px; }
.action-switcher {
  display: flex; gap: 0; margin-top: 16px;
  background: var(--color-bg-input); border-radius: var(--radius-md);
  padding: 4px; overflow: hidden;
}
.action-switcher span {
  flex: 1; text-align: center; padding: 8px 0; border-radius: var(--radius-md);
  font-size: var(--font-size-sm); color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; font-weight: 500;
}
.action-switcher span.active { background: var(--color-primary); color: #fff; }
.result-box { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: var(--radius-sm); }
.result-box--success { background: var(--color-success-light); }
.result-box--error { background: var(--color-danger-light); }
.result-icon { font-size: 32px; }
.result-title { font-size: var(--font-size-lg); font-weight: 600; }
.result-desc { font-size: var(--font-size-sm); color: #991B1B; margin-top: 4px; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state__icon { font-size: 48px; margin-bottom: 12px; }
.empty-state__text { font-size: 15px; color: #999; margin-bottom: 8px; }
</style>
