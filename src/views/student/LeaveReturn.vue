<template>
  <div class="page-container">
    <header class="view-header">
      <h1>返校申请</h1>
    </header>

    <div class="return-page">
      <!-- 空状态：没有需要返校的请假 -->
      <div v-if="!loading && approvedLeaves.length === 0" class="empty-state">
        <van-empty image="search" description="暂无需返校的请假记录">
          <template #bottom>
            <p class="empty-hint">只有审批通过的请假才能申请返校</p>
            <van-button round type="primary" size="small" @click="$router.push('/student/init')">
              去请假
            </van-button>
          </template>
        </van-empty>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-wrap">
        <van-loading size="32" vertical>加载中...</van-loading>
      </div>

      <!-- 可申请返校的请假列表 -->
      <div v-if="!loading && approvedLeaves.length > 0" class="leave-list">
        <div class="section-title">请选择需要返校的请假记录</div>
        <div
          v-for="leave in approvedLeaves"
          :key="leave.id"
          class="leave-card"
          @click="selectedLeave = selectedLeave?.id === leave.id ? null : leave"
          :class="{ 'leave-card--selected': selectedLeave?.id === leave.id }"
        >
          <div class="leave-card__header">
            <span class="leave-card__type">
              <van-tag type="warning" size="medium">待返校</van-tag>
              {{ leave.leaveType }}
            </span>
            <span class="leave-card__days">{{ leave.duration }}天</span>
          </div>
          <div class="leave-card__dates">
            {{ leave.startDate }} ~ {{ leave.endDate }}
          </div>
          <div v-if="leave.returnStatus === 'overdue'" class="leave-card__overdue">
            <van-tag type="danger">已超期 {{ leave.overdueDays || 0 }} 天</van-tag>
            <span>请尽快申请返校</span>
          </div>
          <div v-if="leave.returnStatus === 'pending'" class="leave-card__pending">
            <van-tag type="primary">返校审批中</van-tag>
          </div>
          <!-- 选中后显示详情 -->
          <div v-if="selectedLeave?.id === leave.id" class="leave-card__detail">
            <van-divider />
            <div class="detail-row">
              <span>请假原因：</span>
              <span>{{ leave.reason }}</span>
            </div>
            <div class="detail-row">
              <span>预计返校：</span>
              <span>{{ leave.endDate }}</span>
            </div>
            <div v-if="leave.returnStatus === 'overdue'" class="detail-row overdue-row">
              <span>超时天数：</span>
              <span class="overdue-days">{{ leave.overdueDays || 0 }} 天</span>
            </div>
            <div v-if="leave.returnStatus === 'approved'" class="pass-status pass-status--active">
              <span class="pass-dot pass-dot--green"></span>
              <span>通行 - 通过校门可开启新请假申请</span>
            </div>
            <div v-else-if="leave.returnStatus === 'none' || leave.returnStatus === 'overdue'" class="pass-status pass-status--inactive">
              <span class="pass-dot pass-dot--red"></span>
              <span>不通行 - 请完成返校申请后可开启通行状态</span>
            </div>
            <van-button
              v-if="leave.returnStatus !== 'pending' && leave.returnStatus !== 'approved'"
              round
              block
              type="primary"
              :loading="submitting"
              @click.stop="onSubmitReturn(leave)"
              style="margin-top: 12px;"
            >
              {{ leave.returnStatus === 'overdue' ? '提交超期返校申请' : '提交返校申请' }}
            </van-button>
            <van-button
              v-if="leave.returnStatus === 'overdue'"
              round
              block
              plain
              type="warning"
              @click.stop="onDelayReturn(leave)"
              style="margin-top: 8px;"
            >
              申请延期返校
            </van-button>
            <p v-if="leave.returnStatus === 'pending'" class="pending-text">该请假返校申请正在审批中，请耐心等待</p>
            <p v-if="leave.returnStatus === 'approved'" class="approved-text">返校申请已通过，可以通行</p>
          </div>
        </div>
      </div>

      <!-- 返校申请结果弹窗 -->
      <van-dialog
        v-model:show="showResult"
        :title="resultSuccess ? '提交成功' : '提交失败'"
        :message="resultMessage"
        :confirm-button-text="resultSuccess ? '查看详情' : '知道了'"
        :show-cancel-button="false"
        @confirm="onResultConfirm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'

const router = useRouter()
const leaveStore = useLeaveStore()
const loading = ref(true)
const submitting = ref(false)
const selectedLeave = ref(null)
const showResult = ref(false)
const resultSuccess = ref(false)
const resultMessage = ref('')

// 只显示审批通过且需要返校的请假记录
const approvedLeaves = computed(() => {
  return leaveStore.leaves.filter(l => {
    // 审批通过的请假
    if (l.status !== 'approved') return false
    // returnStatus: none（未申请返校）/ overdue（超期未返校）/ pending（返校审批中）
    return l.returnStatus === 'none' || l.returnStatus === 'overdue' || l.returnStatus === 'pending'
  })
})

onMounted(async () => {
  await leaveStore.fetchLeaves({ page_size: 100 })
  loading.value = false
})

async function onSubmitReturn(leave) {
  submitting.value = true
  try {
    const result = await leaveStore.applyReturn(leave.id)
    if (result.success) {
      resultSuccess.value = true
      resultMessage.value = `返校申请已提交成功！\n通行码：${result.data.pass_code || '无'}`
      // 刷新数据
      await leaveStore.fetchLeaves({ page_size: 100 })
    } else {
      resultSuccess.value = false
      resultMessage.value = result.message || '提交失败，请稍后重试'
    }
    showResult.value = true
  } catch (err) {
    resultSuccess.value = false
    resultMessage.value = err.message || '提交失败'
    showResult.value = true
  } finally {
    submitting.value = false
  }
}

function onResultConfirm() {
  showResult.value = false
  selectedLeave.value = null
  if (resultSuccess.value) {
    router.push('/student/history')
  }
}

function onDelayReturn(leave) {
  router.push(`/student/leave/${leave.id}/delay/processing`)
}
</script>

<style scoped>
.return-page {
  padding-bottom: 40px;
}

.empty-state {
  padding-top: 60px;
}

.empty-hint {
  font-size: 13px;
  color: #999;
  margin: 0 0 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.section-title {
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background: #f5f7fa;
}

.leave-card {
  margin: 10px 14px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.leave-card--selected {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
  border: 1px solid var(--color-primary);
}

.leave-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leave-card__type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.leave-card__days {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.leave-card__dates {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.leave-card__overdue,
.leave-card__pending {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: #e74c3c;
}

.leave-card__detail {
  margin-top: 4px;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin: 4px 0;
  font-size: 13px;
  color: #555;
}

.detail-row span:first-child {
  color: #999;
  min-width: 70px;
}

.pending-text {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-primary);
  text-align: center;
}

.approved-text {
  margin-top: 12px;
  font-size: 13px;
  color: #27ae60;
  text-align: center;
  font-weight: 500;
}

.pass-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.pass-status--active {
  background: #e8f5e9;
  color: #27ae60;
}

.pass-status--inactive {
  background: #fdecea;
  color: #e74c3c;
}

.pass-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pass-dot--green {
  background: #27ae60;
}

.pass-dot--red {
  background: #e74c3c;
}

.overdue-row {
  margin-top: 4px;
}

.overdue-days {
  color: #e74c3c;
  font-weight: 600;
}
</style>
