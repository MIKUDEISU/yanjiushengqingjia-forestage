<template>
  <div id="app-root">
    <div v-if="isLoginPage" class="login-wrapper">
      <router-view />
    </div>
    <div v-else class="app-body">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__logo">🎓</div>
          <div class="sidebar__title">研究生请假管理系统</div>
        </div>

        <nav class="sidebar__nav">
          <template v-if="isStudent">
            <div class="sidebar__group">学生功能</div>
            <router-link to="/student/init" class="nav-item" active-class="nav-item--active">
              <span>📝 发起请假</span>
            </router-link>
            <router-link to="/student/return" class="nav-item" active-class="nav-item--active">
              <span>🏠 返校申请</span>
            </router-link>
            <router-link to="/student/history" class="nav-item" active-class="nav-item--active">
              <span>📋 请假记录</span>
            </router-link>
          </template>
          <template v-if="isAdmin">
            <div class="sidebar__group">管理功能</div>
            <router-link to="/admin/list" class="nav-item" active-class="nav-item--active">
              <span>✅ 审批列表</span>
            </router-link>
            <router-link to="/admin/statistics" class="nav-item" active-class="nav-item--active">
              <span>📊 数据统计</span>
            </router-link>
            <router-link to="/admin/history" class="nav-item" active-class="nav-item--active">
              <span>📄 审批记录</span>
            </router-link>
          </template>
          <div style="flex:1"></div>
          <router-link to="/role-switch" class="nav-item" active-class="nav-item--active" style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:14px;">
            <span>🔄 角色切换</span>
          </router-link>
        </nav>

        <div class="sidebar__footer">
          <div class="sidebar__user">
            <div class="sidebar__user-avatar">{{ userName?.charAt(0) || '?' }}</div>
            <div class="sidebar__user-info">
              <div class="sidebar__user-name">{{ userName || '未登录' }}</div>
              <div class="sidebar__user-role">{{ roleName }}</div>
            </div>
          </div>
          <button class="sidebar__logout" @click="handleLogout">退出登录</button>
        </div>
      </aside>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.name === 'Login')
const isStudent = computed(() => authStore.isStudent)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.userName)
const roleName = computed(() => authStore.roleName)

function handleLogout() {
  authStore.logout()
}

onMounted(() => {
  authStore.init()
})
</script>

<style>
#app-root { height: 100vh; overflow: hidden; }
.login-wrapper { height: 100vh; }
.app-body { display: flex; height: 100vh; }

.sidebar {
  width: 240px; min-width: 240px; height: 100vh;
  background: linear-gradient(180deg, #1a2332 0%, #1e3a5f 100%);
  color: #fff; display: flex; flex-direction: column;
  box-shadow: 2px 0 12px rgba(0,0,0,0.15); z-index: 100;
}
.sidebar__brand {
  padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; gap: 12px;
}
.sidebar__logo { font-size: 32px; }
.sidebar__title { font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
.sidebar__group {
  padding: 16px 14px 6px; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;
}
.sidebar__nav {
  flex: 1; padding: 4px 12px 12px; display: flex; flex-direction: column;
  gap: 2px; overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 11px 14px;
  border-radius: 8px; color: rgba(255,255,255,0.7); text-decoration: none;
  font-size: 14px; transition: all 0.15s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item--active {
  background: rgba(255,255,255,0.18) !important; color: #fff !important; font-weight: 600;
}
.sidebar__footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
.sidebar__user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sidebar__user-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; flex-shrink: 0;
}
.sidebar__user-info { flex: 1; min-width: 0; }
.sidebar__user-name {
  font-size: 14px; font-weight: 600; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.sidebar__user-role { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.sidebar__logout {
  width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px; background: transparent; color: rgba(255,255,255,0.7);
  font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.sidebar__logout:hover {
  background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); color: #f87171;
}
.main-content { flex: 1; overflow-y: auto; background: #f0f4f8; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s ease; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; }
</style>
