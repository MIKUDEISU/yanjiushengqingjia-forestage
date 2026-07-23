<template>
  <div class="page-container">
    <header class="view-header"><h1>返校凭证</h1></header>

    <div class="page-content" v-if="leave">
      <div class="success-banner">
        <div class="success-banner__icon"></div>
        <div class="success-banner__title">返校审批通过</div>
        <div class="success-banner__desc">欢迎返校！以下是您的返校凭证信息</div>
      </div>

      <div class="content-card">
        <div class="section-title">返校凭证</div>
        <div class="pass-card">
          <div class="pass-card__header">
            <div class="pass-card__title">入校通行码</div>
            <div class="pass-card__status">
              <van-tag type="success" size="medium">有效</van-tag>
            </div>
          </div>
          <div class="pass-card__code">
            <div class="qr-placeholder">
              <div class="qr-code">返校码</div>
              <div class="qr-id">PASS-{{ String(leave.id).padStart(6, '0') }}</div>
            </div>
          </div>
          <div class="pass-card__info">
            <div class="info-row"><div class="info-row__label">姓名</div><div class="info-row__value">{{ leave.studentName }}</div></div>
            <div class="info-row"><div class="info-row__label">学号</div><div class="info-row__value">{{ leave.studentId }}</div></div>
            <div class="info-row"><div class="info-row__label">班级</div><div class="info-row__value">{{ leave.className }}</div></div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="section-title">返校注意事项</div>
        <div class="tips-list">
          <div class="tip-item">请于返校当日携带学生证及入校码</div>
          <div class="tip-item">返校后24小时内到辅导员处报到销假</div>
          <div class="tip-item">如有身体不适请提前联系校医院</div>
          <div class="tip-item">宿舍入住前请在宿管处登记</div>
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
.success-banner {
  text-align: center; padding: 28px 16px;
  background: linear-gradient(135deg, #059669, #10B981); color: #fff;
}
.success-banner__icon { font-size: 48px; margin-bottom: 8px; }
.success-banner__title { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: 4px; }
.success-banner__desc { font-size: var(--font-size-sm); opacity: 0.9; }
.pass-card {
  border: 2px dashed var(--color-primary-lighter);
  border-radius: var(--radius-md); overflow: hidden;
}
.pass-card__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; background: var(--color-primary-bg);
}
.pass-card__title { font-size: var(--font-size-md); font-weight: 600; color: var(--color-primary-dark); }
.pass-card__code { padding: 20px; text-align: center; }
.qr-placeholder {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  width: 140px; height: 140px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  border-radius: var(--radius-md); color: #fff;
}
.qr-code { font-size: var(--font-size-lg); font-weight: 700; }
.qr-id { font-size: var(--font-size-xs); margin-top: 6px; opacity: 0.8; }
.pass-card__info { padding: 0 14px 14px; }
.tips-list { display: flex; flex-direction: column; gap: 10px; }
.tip-item { font-size: var(--font-size-sm); color: var(--color-text-secondary); padding: 8px 0; border-bottom: 1px solid var(--color-border-light); }
.tip-item:last-child { border-bottom: none; }
</style>