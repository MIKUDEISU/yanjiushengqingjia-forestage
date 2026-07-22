import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import Login from '@/views/Login.vue'

import LeaveInit from '@/views/student/LeaveInit.vue'
import LeaveHistory from '@/views/student/LeaveHistory.vue'
import LeaveLessThan2w from '@/views/student/LeaveLessThan2w.vue'
import Leave2wTo4w from '@/views/student/Leave2wTo4w.vue'
import Leave4wTo8w from '@/views/student/Leave4wTo8w.vue'
import LeaveMoreThan8w from '@/views/student/LeaveMoreThan8w.vue'
import LeaveProcessing from '@/views/student/LeaveProcessing.vue'
import LeaveRejected from '@/views/student/LeaveRejected.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { noAuth: true }
  },
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      authStore.init()
      if (!authStore.isLoggedIn) return '/login'
      return '/student/init'
    }
  },
  { path: '/student/init', name: 'LeaveInit', component: LeaveInit, meta: { role: 'student' } },
  { path: '/student/history', name: 'LeaveHistory', component: LeaveHistory, meta: { role: 'student' } },
  { path: '/student/leave/less-than-2w', name: 'LeaveLessThan2w', component: LeaveLessThan2w, meta: { role: 'student' } },
  { path: '/student/leave/2w-to-4w', name: 'Leave2wTo4w', component: Leave2wTo4w, meta: { role: 'student' } },
  { path: '/student/leave/4w-to-8w', name: 'Leave4wTo8w', component: Leave4wTo8w, meta: { role: 'student' } },
  { path: '/student/leave/more-than-8w', name: 'LeaveMoreThan8w', component: LeaveMoreThan8w, meta: { role: 'student' } },
  { path: '/student/leave/:id/processing', name: 'LeaveProcessing', component: LeaveProcessing, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/rejected', name: 'LeaveRejected', component: LeaveRejected, props: true, meta: { role: 'student' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.init()

  if (to.meta.noAuth) {
    return next()
  }

  if (!authStore.isLoggedIn) {
    return next('/login')
  }

  next()
})

export default router
