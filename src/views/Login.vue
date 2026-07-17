<script setup>
import {ref, reactive} from 'vue'
import {ElMessage} from 'element-plus'
import {User, Lock, Postcard} from '@element-plus/icons-vue'
import {useUserInfoStore} from '@/stores/userInfo'
import {useRouter} from 'vue-router'
import {loginService, userInfoService} from '@/api/user'
import axios from "axios";

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 表单数据
const loginForm = reactive({
  studentId: '',
  name: '',
  password: ''
})

// 表单校验规则
const rules = {
  studentId: [
    {required: true, message: '请输入学号', trigger: 'blur'},
    {message: '学号', trigger: 'blur'}
  ],
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
    {message: '姓名', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {message: '密码', trigger: 'blur'}
  ]
}

const loginFormRef = ref(null)
const loading = ref(false)

// 登录
const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    _login({
      loginName: loginForm.name,
      password: loginForm.password,
      studentId: loginForm.studentId,
    }).then(function (res) {
      console.info(res)
      if (res.data.data === null) {
        ElMessage.warning('用户名或密码错误')
      }else {
        ElMessage.success('登录成功')
        // 根据用户remark字段跳转不同页面
        // remark为"老师" → 请假审批页，remark为"学生" → 请假申请表
        const remark = res.data.remark || res.data.data?.remark || ''
        if (remark === '老师') {
          router.push({path: '/leave/approval'})
        } else if (remark === '学生') {
          router.push({path: '/leave/application'})
        } else {
          // 默认跳转到用户管理页
          router.push({path:'/user/list'})
        }
      }
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 标题区域 -->
      <div class="login-header">
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M24 8l-12 7v14l12 7 12-7V15L24 8z" fill="currentColor" opacity="0.15"/>
            <path d="M18 20h12M18 25h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="title">研究生请假系统</h1>
        <p class="subtitle">Graduate Leave Management System</p>
      </div>

      <!-- 表单区域 -->
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          class="login-form"
          @keyup.enter="handleLogin"
      >
        <el-form-item prop="studentId">
          <el-input
              v-model="loginForm.studentId"
              placeholder="请输入学号"
              :prefix-icon="Postcard"
              clearable
          />
        </el-form-item>

        <el-form-item prop="name">
          <el-input
              v-model="loginForm.name"
              placeholder="请输入姓名"
              :prefix-icon="User"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部信息 -->
      <div class="login-footer">
        <span>© 2026 研究生请假管理系统</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -80px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -60px;
  left: -60px;
  animation: float 6s ease-in-out infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 10%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
              0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标题区域 */
.login-header {
  text-align: center;
  margin-bottom: 36px;

  .logo-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    color: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .title {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 6px;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
    letter-spacing: 1px;
  }
}

/* 表单 */
.login-form {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    padding: 4px 12px;
    box-shadow: 0 0 0 1px #e5e7eb inset;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px #c4b5fd inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px #667eea inset;
    }
  }

  :deep(.el-input__prefix .el-icon) {
    color: #9ca3af;
    font-size: 18px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-form-item__error) {
    padding-top: 4px;
    font-size: 12px;
  }
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 底部 */
.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  span {
    font-size: 12px;
    color: #b0b0b0;
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    width: calc(100vw - 32px);
    padding: 36px 24px 28px;
    border-radius: 16px;
  }
}
</style>
