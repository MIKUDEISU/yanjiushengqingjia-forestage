<template>
  <div class="page-container">
    <header class="view-header"><h1>请假确认（＞8周）</h1></header>

    <div class="confirm-page">
      <div class="flow-card flow-card--special">
        <div class="flow-card__icon"></div>
        <div class="flow-card__title">特殊审批流程</div>
        <div class="flow-card__desc">请假时长超过8周，需 <strong>辅导员 → 院系 → 学工处 → 校领导</strong> 四级审批，并启动休学/复学联动评估</div>
      </div>

      <div class="content-card">
        <div class="section-title">审批流程</div>
        <van-steps :active="0" direction="vertical">
          <van-step>
            <template #active-icon><van-icon name="clock-o" color="#2563EB" /></template>
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
            <h4>第四级：校领导终审</h4>
            <p>审批人：陈校长 | 预计：5-7个工作日</p>
          </van-step>
          <van-step>
            <h4>审批完成</h4>
            <p>全部审批通过后办理休学手续</p>
          </van-step>
        </van-steps>
      </div>

      <div class="content-card">
        <div class="section-title">休学/复学联动提醒</div>
        <div class="alert-box">
          <div class="alert-item">
            <van-icon name="warning-o" color="#EF4444" />
            <span>系统检测请假时长超过8周（56天）</span>
          </div>
          <div class="alert-item">
            <van-icon name="checked" color="#10B981" />
            <span>自动关联教务系统，启动休学预评估</span>
          </div>
          <div class="alert-item">
            <van-icon name="description" color="#6366F1" />
            <span>需在返校前30天提交复学申请</span>
          </div>
          <div class="alert-item">
            <van-icon name="balance-o" color="#F59E0B" />
            <span>学费缓缴与住宿费退还方案将自动计算</span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <van-button round block type="primary" @click="confirmSubmit" :loading="loading">
          已知晓并确认提交（含休学联动）
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
    latestLeave.totalSteps = 4
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
  showSuccessToast('长假申请已提交，等待审批')
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
  border: 2px solid #EF4444;
}
.flow-card--special { background: linear-gradient(135deg, #FFF7ED, #FFEDD5); border-color: #F97316; }
.flow-card__icon { font-size: 40px; margin-bottom: 8px; }
.flow-card__title { font-size: var(--font-size-lg); font-weight: 700; color: #991B1B; margin-bottom: 6px; }
.flow-card__desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6; }
.alert-box { display: flex; flex-direction: column; gap: 10px; }
.alert-item { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-sm); color: var(--color-text-primary); padding: 8px 0; }
.action-bar { padding: 16px; margin-top: 8px; }
</style>