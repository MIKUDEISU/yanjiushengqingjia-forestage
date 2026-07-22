import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import Login from '@/views/Login.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { noAuth: true } },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.init()
  if (to.meta.noAuth) return next()
  if (!authStore.isLoggedIn) return next('/login')
  next()
})

export default router
