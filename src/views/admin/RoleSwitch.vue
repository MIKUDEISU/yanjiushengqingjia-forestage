<template>
  <div class="page-container">
    <header class="view-header"><h1>角色切换</h1></header>

    <div class="role-page">
      <div class="role-banner">
        <div class="role-banner__icon">🔄</div>
        <div class="role-banner__title">当前用户</div>
        <div class="role-banner__desc">{{ authStore.userName }} ({{ authStore.roleName }})</div>
      </div>

      <div class="content-card">
        <div class="section-title">快捷入口</div>
        <van-cell-group inset>
          <van-cell v-if="authStore.isStudent" title="请假申请" icon="edit" is-link @click="$router.push('/student/init')" />
          <van-cell v-if="authStore.isStudent" title="请假记录" icon="records" is-link @click="$router.push('/student/history')" />
          <van-cell v-if="authStore.isAdmin" title="审批列表" icon="todo-list-o" is-link @click="$router.push('/admin/list')" />
          <van-cell v-if="authStore.isAdmin" title="数据统计" icon="chart-trending-o" is-link @click="$router.push('/admin/statistics')" />
          <van-cell v-if="authStore.isAdmin" title="审批记录" icon="description" is-link @click="$router.push('/admin/history')" />
        </van-cell-group>
      </div>

      <div class="content-card">
        <van-button round block type="danger" @click="handleLogout">
          <van-icon name="revoke" /> 退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>

<style scoped>
.role-page { padding-bottom: 40px; }
.role-banner { text-align: center; padding: 24px 20px; background: linear-gradient(135deg, var(--color-primary), #4F46E5); color: #fff; }
.role-banner__icon { font-size: 48px; margin-bottom: 8px; }
.role-banner__title { font-size: var(--font-size-xl); font-weight: 700; margin-bottom: 6px; }
.role-banner__desc { font-size: var(--font-size-sm); opacity: 0.85; }
.content-card { background: var(--color-bg-card); border-radius: var(--radius-md); margin: 12px 16px; padding: 16px; box-shadow: var(--shadow-sm); }
.section-title { font-size: var(--font-size-md); font-weight: 600; margin-bottom: 12px; }
</style>
