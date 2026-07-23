import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

export const useUserStore = defineStore('user', () => {
  const role = ref('student')
  const currentStudentId = ref('')

  const isStudent = computed(() => {
    const auth = useAuthStore()
    if (auth.isLoggedIn) return auth.isStudent
    return role.value === 'student'
  })

  const isAdmin = computed(() => {
    const auth = useAuthStore()
    if (auth.isLoggedIn) return auth.isAdmin
    return role.value === 'admin'
  })

  function switchRole(newRole) {
    role.value = newRole
    localStorage.setItem('app-role', newRole)
  }

  function toggleRole() {
    role.value = role.value === 'student' ? 'admin' : 'student'
    localStorage.setItem('app-role', role.value)
  }

  function setCurrentStudent(id) {
    currentStudentId.value = id
  }

  function initFromStorage() {
    const auth = useAuthStore()
    auth.init()
    if (!auth.isLoggedIn) {
      const saved = localStorage.getItem('app-role')
      if (saved === 'student' || saved === 'admin') {
        role.value = saved
      }
    }
  }

  return {
    role, currentStudentId, isStudent, isAdmin,
    switchRole, toggleRole, setCurrentStudent, initFromStorage
  }
})
