<template>
  <div class="page-container">
    <header class="view-header"><h1>请假确认（＜2周）</h1></header>

    <div class="confirm-page">
      <div class="flow-card">
        <div class="flow-card__icon"></div>
        <div class="flow-card__title">简易审批流程</div>
        <div class="flow-card__desc">请假时长小于2周，仅需 <strong>辅导员一级审批</strong> 即可</div>
      </div>

      <div class="content-card">
        <div class="section-title">审批流程</div>
        <van-steps :active="0" direction="vertical">
          <van-step>
            <template #active-icon>
              <van-icon name="clock-o" color="#2563EB" />
            </template>
            <h4>辅导员审批</h4>
            <p>审批人：李老师 | 预计处理时间：1个工作日内</p>
          </van-step>
          <van-step>
            <h4>审批完成</h4>
            <p>审批通过后即可离校</p>
          </van-step>
        </van-steps>
      </div>

      <div class="content-card">
        <div class="warning-box">
          <van-icon name="info-o" color="#F59E0B" size="18" />
          <div class="warning-box__text">
            <strong>温馨提示：</strong>请假期间请注意人身安全，保持通讯畅通，按时返校。
          </div>
        </div>
      </div>

      <div class="action-bar">
        <van-button round block type="primary" @click="confirmSubmit" :loading="loading">
          确认提交申请
        </van-button>
        <van-button round block plain type="default" @click="$router.back()" style="margin-top: 10px;">
          返回修改
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const router = useRouter()
const leaveStore = useLeaveStore()
const loading = ref(false)

function confirmSubmit() {
  loading.value = true
  const latestLeave = leaveStore.allLeaves[0]
  if (latestLeave) {
    latestLeave.totalSteps = 1
    latestLeave.currentStep = 1
    latestLeave.currentApprover = '辅导员-李老师'
    latestLeave.timeline.push({
      time: latestLeave.timeline[0]?.time || '',
      title: '辅导员审批',
      desc: '待辅导员-李老师审批',
      status: 'processing'
    })
  }
  loading.value = false
  showSuccessToast('请假申请已提交，等待审批')
  const id = latestLeave?.id || 1
  router.push(`/student/leave/${id}/processing`)
}
</script>

<style scoped>
.confirm-page { padding-bottom: 40px; }

.flow-card {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border-radius: var(--radius-md);
  padding: 20px;
  margin: 16px;
  text-align: center;
  border: 1px solid #BFDBFE;
}
.flow-card__icon { font-size: 36px; margin-bottom: 8px; }
.flow-card__title { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary-dark); margin-bottom: 6px; }
.flow-card__desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6; }

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--color-warning-light);
  border-radius: var(--radius-sm);
  padding: 12px;
}
.warning-box__text { font-size: var(--font-size-sm); color: #92400E; line-height: 1.6; }

.action-bar { padding: 16px; margin-top: 8px; }
</style>