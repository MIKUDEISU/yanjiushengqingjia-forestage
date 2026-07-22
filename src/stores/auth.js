import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, setToken, removeToken } from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth-token') || '')
  const user = ref(JSON.parse(localStorage.getItem('auth-user') || 'null'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isStudent = computed(() => user.value?.role === 'student')
  const isAdmin = computed(() => {
    const r = user.value?.role
    return r === 'admin' || r === 'tutor' || r === 'counselor' || r === 'college_leader' || r === 'party_secretary'
  })
  const roleName = computed(() => {
    const map = {
      student: '学生',
      tutor: '导师',
      counselor: '辅导员',
      college_leader: '院领导',
      party_secretary: '副书记',
      admin: '管理员'
    }
    return map[user.value?.role] || '未知'
  })
  const userId = computed(() => user.value?.id)
  const userName = computed(() => user.value?.name || user.value?.username || '')

  async function login(username, password) {
    loading.value = true
    try {
      const res = await api.post('/auth/login', { username, password })
      if (res.code === 200) {
        token.value = res.data.token
        user.value = res.data.user
        setToken(res.data.token)
        localStorage.setItem('auth-user', JSON.stringify(res.data.user))
        return { success: true }
      }
      return { success: false, message: res.message || '登录失败' }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/profile')
      if (res.code === 200) {
        user.value = {
          ...user.value,
          ...res.data
        }
        localStorage.setItem('auth-user', JSON.stringify(user.value))
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  async function changePassword(oldPassword, newPassword) {
    try {
      const res = await api.put('/auth/password', { oldPassword, newPassword })
      if (res.code === 200) return { success: true }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    removeToken()
    window.location.hash = '#/login'
  }

  function init() {
    const savedToken = localStorage.getItem('auth-token')
    const savedUser = localStorage.getItem('auth-user')
    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        user.value = null
      }
    }
  }

  return {
    token, user, loading,
    isLoggedIn, isStudent, isAdmin, roleName, userId, userName,
    login, logout, fetchProfile, changePassword, init
  }
})
