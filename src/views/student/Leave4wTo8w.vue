<template>
  <div class="page-container">
    <header class="view-header"><h1>请假确认（4-8周）</h1></header>

    <div class="confirm-page">
      <div class="flow-card flow-card--tertiary">
        <div class="flow-card__icon"></div>
        <div class="flow-card__title">三级审批流程</div>
        <div class="flow-card__desc">请假时长在4-8周，需 <strong>辅导员 → 院系 → 学工处</strong> 三级审批</div>
      </div>

      <div class="content-card">
        <div class="section-title">审批流程</div>
        <van-steps :active="0" direction="vertical">
          <van-step>
            <template #active-icon>
              <van-icon name="clock-o" color="#2563EB" />
            </template>
            <h4>第一级：辅导员审批</h4>
            <p>审批人：李老师 | 预计：1-2个工作日</p>
          </van-step>
          <van-step>
            <h4>第二级：院系负责人审批</h4>
            <p>审批人：王主任 | 预计：2-3个工作日</p>
          </van-step>
          <van-step>
            <h4>第三级：学工处审批</h4>
            <p>审批人：张处长 | 预计：3-5个工作日</p>
          </van-step>
          <van-step>
            <h4>审批完成</h4>
            <p>全部审批通过后即可离校</p>
          </van-step>
        </van-steps>
      </div>

      <div class="content-card">
        <div class="warning-box">
          <van-icon name="warning-o" color="#EF4444" size="18" />
          <div class="warning-box__text">
            <strong>4-8周长假注意事项：</strong>请务必与教务处确认课程缓考安排，与辅导员保持每周至少一次联系。
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
    latestLeave.totalSteps = 3
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
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
  border-radius: var(--radius-md);
  padding: 20px; margin: 16px; text-align: center;
  border: 1px solid #FECACA;
}
.flow-card--tertiary { background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-color: #FCD34D; }
.flow-card__icon { font-size: 36px; margin-bottom: 8px; }
.flow-card__title { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary-dark); margin-bottom: 6px; }
.flow-card__desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6; }
.warning-box { display: flex; align-items: flex-start; gap: 10px; background: var(--color-danger-light); border-radius: var(--radius-sm); padding: 12px; }
.warning-box__text { font-size: var(--font-size-sm); color: #991B1B; line-height: 1.6; }
.action-bar { padding: 16px; margin-top: 8px; }
</style>