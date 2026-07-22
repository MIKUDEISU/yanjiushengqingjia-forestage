<template>
  <div id="app-root">
    <div class="app-body" v-if="!isLoginPage && authStore.isLoggedIn">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__logo">🎓</div>
          <div class="sidebar__title">研究生请假管理系统</div>
        </div>

        <nav class="sidebar__nav">
          <!-- Phase 1: No routes available yet — nav links added in Phase 2 -->
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
    <div v-else class="login-wrapper">
      <router-view />
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
#app-root {
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  height: 100vh;
}

.login-wrapper {
  height: 100vh;
}

.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #1a2332 0%, #1e3a5f 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0,0,0,0.15);
  z-index: 100;
}

.sidebar__brand {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar__logo {
  font-size: 32px;
}

.sidebar__title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.sidebar__nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar__user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.sidebar__user-info {
  flex: 1;
}

.sidebar__user-name {
  font-size: 14px;
  font-weight: 600;
}

.sidebar__user-role {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
}

.sidebar__logout {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.sidebar__logout:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f0f4f8;
  padding: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
