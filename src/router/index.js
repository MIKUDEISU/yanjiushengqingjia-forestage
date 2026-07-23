import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import Login from '@/views/Login.vue'

import LeaveInit from '@/views/student/LeaveInit.vue'
import LeaveReturn from '@/views/student/LeaveReturn.vue'
import LeaveHistory from '@/views/student/LeaveHistory.vue'
import LeaveLessThan2w from '@/views/student/LeaveLessThan2w.vue'
import Leave2wTo4w from '@/views/student/Leave2wTo4w.vue'
import Leave4wTo8w from '@/views/student/Leave4wTo8w.vue'
import LeaveMoreThan8w from '@/views/student/LeaveMoreThan8w.vue'
import LeaveProcessing from '@/views/student/LeaveProcessing.vue'
import LeaveRejected from '@/views/student/LeaveRejected.vue'
import ReturnApproved from '@/views/student/ReturnApproved.vue'
import ReturnRejected from '@/views/student/ReturnRejected.vue'
import ReturnProcessing from '@/views/student/ReturnProcessing.vue'
import DelayApproved from '@/views/student/DelayApproved.vue'
import DelayRejected from '@/views/student/DelayRejected.vue'
import DelayProcessing from '@/views/student/DelayProcessing.vue'

import AdminApprovalList from '@/views/admin/AdminApprovalList.vue'
import AdminApprovalDetail from '@/views/admin/AdminApprovalDetail.vue'
import DataStatistics from '@/views/admin/DataStatistics.vue'
import RoleSwitch from '@/views/admin/RoleSwitch.vue'
import ApprovalHistory from '@/views/admin/ApprovalHistory.vue'

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
      return authStore.isAdmin ? '/admin/list' : '/student/init'
    }
  },
  { path: '/student/init', name: 'LeaveInit', component: LeaveInit, meta: { role: 'student' } },
  { path: '/student/return', name: 'LeaveReturn', component: LeaveReturn, meta: { role: 'student' } },
  { path: '/student/history', name: 'LeaveHistory', component: LeaveHistory, meta: { role: 'student' } },
  { path: '/student/leave/less-than-2w', name: 'LeaveLessThan2w', component: LeaveLessThan2w, meta: { role: 'student' } },
  { path: '/student/leave/2w-to-4w', name: 'Leave2wTo4w', component: Leave2wTo4w, meta: { role: 'student' } },
  { path: '/student/leave/4w-to-8w', name: 'Leave4wTo8w', component: Leave4wTo8w, meta: { role: 'student' } },
  { path: '/student/leave/more-than-8w', name: 'LeaveMoreThan8w', component: LeaveMoreThan8w, meta: { role: 'student' } },
  { path: '/student/leave/:id/processing', name: 'LeaveProcessing', component: LeaveProcessing, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/rejected', name: 'LeaveRejected', component: LeaveRejected, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/return/approved', name: 'ReturnApproved', component: ReturnApproved, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/return/rejected', name: 'ReturnRejected', component: ReturnRejected, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/return/processing', name: 'ReturnProcessing', component: ReturnProcessing, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/delay/approved', name: 'DelayApproved', component: DelayApproved, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/delay/rejected', name: 'DelayRejected', component: DelayRejected, props: true, meta: { role: 'student' } },
  { path: '/student/leave/:id/delay/processing', name: 'DelayProcessing', component: DelayProcessing, props: true, meta: { role: 'student' } },
  { path: '/admin/list', name: 'AdminApprovalList', component: AdminApprovalList, meta: { role: 'admin' } },
  { path: '/admin/detail/:id', name: 'AdminApprovalDetail', component: AdminApprovalDetail, props: true, meta: { role: 'admin' } },
  { path: '/admin/statistics', name: 'DataStatistics', component: DataStatistics, meta: { role: 'admin' } },
  { path: '/admin/history', name: 'ApprovalHistory', component: ApprovalHistory, meta: { role: 'admin' } },
  { path: '/role-switch', name: 'RoleSwitch', component: RoleSwitch }
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

  if (to.meta.role === 'student' && !authStore.isStudent) {
    return next('/admin/list')
  }
  if (to.meta.role === 'admin' && authStore.isStudent) {
    return next('/student/init')
  }

  next()
})

export default router
