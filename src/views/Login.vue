<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 头部 -->
      <div class="login-header">
        <div class="login-logo">🎓</div>
        <h1 class="login-title">研究生请假系统</h1>
        <p class="login-subtitle">武汉大学</p>
      </div>

      <!-- 表单 -->
      <van-form @submit="handleLogin" class="login-form">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
            left-icon="user-o"
            clearable
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            left-icon="lock"
            clearable
          />
        </van-cell-group>

        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            loading-text="登录中..."
          >
            登 录
          </van-button>
        </div>
      </van-form>

      <!-- 提示 -->
      <div class="login-tips">
        <p class="tips-title">🔑 测试账号</p>
        <div class="tips-grid">
          <div class="tip-item" v-for="acc in testAccounts" :key="acc.user" @click="quickFill(acc)">
            <span class="tip-role">{{ acc.role }}</span>
            <span class="tip-user">{{ acc.user }}</span>
          </div>
        </div>
        <p class="tips-pwd">密码均为: 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { showToast } from 'vant'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const testAccounts = [
  { role: '学生', user: 'zhangsan' },
  { role: '导师', user: 'daoshi01' },
  { role: '辅导员', user: 'fudaoyuan01' },
  { role: '院领导', user: 'lingdao01' },
  { role: '管理员', user: 'admin' }
]

function quickFill(acc) {
  form.username = acc.user
  form.password = '123456'
}

async function handleLogin() {
  loading.value = true
  try {
    const result = await authStore.login(form.username, form.password)
    if (result.success) {
      showToast({ message: '登录成功', icon: 'success', duration: 1000 })
      // 根据角色跳转
      setTimeout(() => {
        if (authStore.isStudent) {
          router.push('/student/init')
        } else {
          router.push('/admin/list')
        }
      }, 500)
    } else {
      showToast({ message: result.message || '登录失败', icon: 'fail' })
    }
  } catch (err) {
    showToast({ message: err.message || '登录失败', icon: 'fail' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.login-header {
  text-align: center;
  padding: 32px 20px 20px;
}

.login-logo {
  font-size: 48px;
  margin-bottom: 8px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.login-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.login-form {
  padding: 8px 0;
}

.login-tips {
  padding: 12px 16px 20px;
  background: #f8f9fb;
  border-top: 1px solid #f0f0f0;
}

.tips-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin: 0 0 10px;
}

.tips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.tip-item:hover {
  border-color: #667eea;
  background: #f0f0ff;
}

.tip-role {
  color: #999;
  font-size: 11px;
}

.tip-user {
  color: #333;
  font-weight: 600;
}

.tips-pwd {
  font-size: 11px;
  color: #aaa;
  margin: 0;
  text-align: center;
}

.van-cell-group--inset {
  margin: 0 16px;
}
</style>
