<!--
  请假申请表页面（学生端）
  功能：学生填写并提交请假申请
  包含：顶部导航栏、请假表单（类型/地址/时间/理由/附件/联系人）、审批流程时间线、提交按钮
-->
<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Minus, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserInfoStore } from '@/stores/userInfo'
import { submitLeaveApplication } from '@/api/leave'
import avatar from '@/assets/default.png'

const router = useRouter()
const userInfoStore = useUserInfoStore()

/* ========== 表单数据 ========== */
const form = reactive({
  leaveWuhan: '是',           // 是否离开武汉
  leaveType: '回家',          // 请假类型
  startTime: '',              // 开始时间
  endTime: '',                // 结束时间
  reason: '',                 // 请假理由
  phone: '',                  // 本人联系电话
  emergencyName: '',          // 紧急联系人姓名
  emergencyPhone: '',         // 紧急联系人电话
})

/* ========== 目的地地址列表（支持动态增减） ========== */
const addressList = reactive([
  { region: '', detail: '' }
])

/* ========== 请假时长（自动计算） ========== */
const leaveDuration = computed(() => {
  if (!form.startTime || !form.endTime) return ''
  const start = new Date(form.startTime)
  const end = new Date(form.endTime)
  const diffMs = end.getTime() - start.getTime()

  if (diffMs <= 0) return '0天0小时'

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  return `${days}天${hours}小时`
})

/* ========== 监听时间变化，自动计算时长 ========== */
watch([() => form.startTime, () => form.endTime], () => {
  // leaveDuration 是 computed，会自动更新
})

/**
 * 添加一个新的地址块
 */
const addAddress = () => {
  addressList.push({ region: '', detail: '' })
}

/**
 * 删除指定索引的地址块（至少保留一个）
 * @param {number} index - 要删除的地址索引
 */
const removeAddress = (index) => {
  if (addressList.length > 1) {
    addressList.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个目的地地址')
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 跳转到个人中心
 */
const goToProfile = () => {
  router.push('/user/info')
}

/* ========== 提交加载状态 ========== */
const submitting = ref(false)

/**
 * 提交请假申请（调用后端API）
 */
const handleSubmit = async () => {
  // 表单校验
  if (!form.leaveType) {
    ElMessage.warning('请选择请假类型')
    return
  }
  if (!form.startTime || !form.endTime) {
    ElMessage.warning('请选择开始和结束时间')
    return
  }
  if (!form.reason.trim()) {
    ElMessage.warning('请填写请假理由')
    return
  }
  if (!form.phone.trim()) {
    ElMessage.warning('请填写本人联系电话')
    return
  }
  if (!form.emergencyName.trim() || !form.emergencyPhone.trim()) {
    ElMessage.warning('请填写紧急联系人信息')
    return
  }

  submitting.value = true
  try {
    // 构造请假申请数据
    const leaveData = {
      userId: userInfoStore.userInfo?.id,
      leaveType: form.leaveType,
      leaveWuhan: form.leaveWuhan,
      startTime: form.startTime,
      endTime: form.endTime,
      reason: form.reason,
      phone: form.phone,
      emergencyName: form.emergencyName,
      emergencyPhone: form.emergencyPhone
    }

    const res = await submitLeaveApplication(leaveData, [])
    if (res.status) {
      ElMessage.success('请假申请已提交，等待审批')
      // 返回上一页或跳转到首页
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      ElMessage.error(res.message || '提交失败，请稍后重试')
    }
  } catch (error) {
    console.error('提交请假申请失败:', error)
    ElMessage.error('网络异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mobile-container">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="header-content">
        <!-- 左侧：返回按钮 + 标题 -->
        <div class="header-left">
          <div class="back-btn" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- 页面标题 -->
          <h1 class="header-title">请假申请</h1>
        </div>
        <!-- 右侧：用户头像 / 个人中心入口 -->
        <div class="header-user" @click="goToProfile">
          <el-avatar :size="32" :src="userInfoStore.userInfo?.avatar || avatar" />
        </div>
      </div>
    </div>

    <!-- ==================== 表单内容区 ==================== -->
    <div class="form-content">

      <!-- ===== 是否离开武汉 ===== -->
      <div class="form-card">
        <div class="form-row" @click="form.leaveWuhan = form.leaveWuhan === '是' ? '否' : '是'">
          <span class="form-label required">是否离开武汉</span>
          <div class="form-value">
            <span>{{ form.leaveWuhan }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- ===== 请假类型 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">请假类型</span>
          <el-select v-model="form.leaveType" class="form-select" placeholder="请选择">
            <el-option label="回家" value="回家" />
            <el-option label="病假" value="病假" />
            <el-option label="事假" value="事假" />
            <el-option label="实习" value="实习" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>
      </div>

      <!-- ===== 目的地地址（可动态增减） ===== -->
      <div class="form-card address-card">
        <div class="card-title-row">
          <span class="card-title">请填写离校目的地的地址(非出发地)</span>
          <el-button type="primary" text class="add-btn" @click="addAddress">
            <el-icon><Plus /></el-icon>
            <span>添加</span>
          </el-button>
        </div>

        <!-- 地址块列表 -->
        <div v-for="(addr, index) in addressList" :key="index" class="address-block">
          <!-- 删除按钮（至少保留一个） -->
          <div v-if="addressList.length > 1" class="remove-btn" @click="removeAddress(index)">
            <el-icon color="#f56c6c"><Minus /></el-icon>
          </div>

          <!-- 所在地区选择 -->
          <div class="form-row">
            <span class="form-label required">所在地区</span>
            <el-select v-model="addr.region" class="form-select" placeholder="请选择">
              <el-option label="湖北省武汉市" value="hubei-wuhan" />
              <el-option label="湖北省其他" value="hubei-other" />
              <el-option label="外省" value="other-province" />
            </el-select>
          </div>

          <!-- 详细地址输入 -->
          <div class="form-row detail-row">
            <span class="form-label required">详细地址</span>
            <el-input
              v-model="addr.detail"
              type="textarea"
              :rows="2"
              placeholder="请详细填写地址信息，如小区名门牌号等"
              class="detail-input"
            />
          </div>
        </div>
      </div>

      <!-- ===== 开始时间 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">开始时间</span>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="请选择"
            class="form-select"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
      </div>

      <!-- ===== 结束时间 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">结束时间</span>
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="请选择"
            class="form-select"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
      </div>

      <!-- ===== 请假时长（自动计算） ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">请假时长</span>
          <span class="form-value-text">{{ leaveDuration || '请选择时间后自动计算' }}</span>
        </div>
      </div>

      <!-- ===== 请假理由 ===== -->
      <div class="form-card">
        <div class="form-row column-row">
          <span class="form-label required">请假理由</span>
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细填写您的请假理由，以便辅导员快速通过审核，字数不超过100字"
            maxlength="100"
            show-word-limit
            class="reason-input"
          />
        </div>
      </div>

      <!-- ===== 附件上传 ===== -->
      <div class="form-card">
        <div class="form-row column-row">
          <span class="form-label">附件</span>
          <p class="upload-hint">病假的同学请上传医院证明，其余请假同学请上传其他证明材料，图片单张大小不超过2M</p>
          <div class="upload-area">
            <el-upload
              action="#"
              :auto-upload="false"
              :limit="3"
              accept="image/*"
              list-type="picture-card"
            >
              <el-icon><Camera /></el-icon>
            </el-upload>
          </div>
        </div>
      </div>

      <!-- ===== 本人联系电话 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">本人联系电话</span>
          <el-input
            v-model="form.phone"
            placeholder="请输入"
            class="form-select"
          />
        </div>
      </div>

      <!-- ===== 紧急联系人姓名 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">紧急联系人姓名</span>
          <el-input
            v-model="form.emergencyName"
            placeholder="请输入"
            class="form-select"
          />
        </div>
      </div>

      <!-- ===== 紧急联系人电话 ===== -->
      <div class="form-card">
        <div class="form-row">
          <span class="form-label required">紧急联系人电话</span>
          <el-input
            v-model="form.emergencyPhone"
            placeholder="请输入"
            class="form-select"
          />
        </div>
      </div>

      <!-- ===== 请假流程时间线 ===== -->
      <div class="form-card timeline-card">
        <div class="card-title">请假流程</div>
        <div class="timeline">
          <!-- 第一个审批节点 -->
          <div class="timeline-item">
            <div class="timeline-dot active"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-role">审批人(导师)</span>
                <div class="timeline-avatar">张</div>
              </div>
              <div class="timeline-name">张三</div>
            </div>
          </div>

          <!-- 会签连接线 -->
          <div class="timeline-connector">
            <div class="connector-line"></div>
            <div class="connector-label">
              <span class="dashed-line"></span>
              <span class="connector-text">1人同意即可进入下一节点</span>
            </div>
          </div>

          <!-- 第二个审批节点 -->
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-role">审批人(导师)</span>
                <div class="timeline-avatar">王</div>
              </div>
              <div class="timeline-name">王贰</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 底部提交按钮 ==================== -->
    <div class="submit-bar">
      <el-button
        type="primary"
        class="submit-btn"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交' }}
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ==================== 移动端容器 ==================== */
.mobile-container {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f0f2f5;
  position: relative;
  padding-bottom: 80px; /* 为底部提交按钮预留空间 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

/* ==================== 顶部导航栏 ==================== */
.header {
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  padding: 16px 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    /* 左侧：返回按钮 + 标题 */
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 返回按钮 */
    .back-btn {
      cursor: pointer;
      color: #fff;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }

    /* 页面标题 */
    .header-title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 1px;
    }

    /* 用户头像（个人中心入口） */
    .header-user {
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

/* ==================== 表单内容区 ==================== */
.form-content {
  padding: 12px 16px;
}

/* ===== 通用表单卡片 ===== */
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ===== 表单行 ===== */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;

  /* 纵向排列模式（用于textarea等） */
  &.column-row {
    flex-direction: column;
    align-items: flex-start;
  }

  /* 表单标签 */
  .form-label {
    font-size: 14px;
    color: #303133;
    flex-shrink: 0;

    /* 必填标记 */
    &.required::before {
      content: '*';
      color: #f56c6c;
      margin-right: 2px;
    }
  }

  /* 表单值（右侧） */
  .form-value {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
  }

  .form-value-text {
    font-size: 14px;
    color: #606266;
  }
}

/* ===== 选择器宽度 ===== */
.form-select {
  width: 160px;

  :deep(.el-input__wrapper) {
    box-shadow: none;
    padding-right: 0;

    .el-input__inner {
      text-align: right;
      font-size: 14px;
      color: #606266;
    }
  }
}

/* ===== 地址卡片特殊样式 ===== */
.address-card {
  .card-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .card-title {
      font-size: 14px;
      color: #303133;
    }

    .add-btn {
      color: #409EFF;
      font-size: 14px;
      border: 1px solid #409EFF;
      border-radius: 16px;
      padding: 4px 14px;

      &:hover {
        background-color: #ecf5ff;
      }
    }
  }

  /* 地址块 */
  .address-block {
    position: relative;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    /* 删除按钮 */
    .remove-btn {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #f56c6c;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(245, 108, 108, 0.3);
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  /* 详细地址输入框 */
  .detail-row {
    margin-top: 8px;

    .detail-input {
      width: 100%;

      :deep(.el-textarea__inner) {
        font-size: 13px;
        border-radius: 8px;
        background: #fff;
      }
    }
  }
}

/* ===== 请假理由输入框 ===== */
.reason-input {
  width: 100%;
  margin-top: 8px;

  :deep(.el-textarea__inner) {
    font-size: 13px;
    border-radius: 8px;
  }
}

/* ===== 附件上传区域 ===== */
.upload-hint {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 12px;
  line-height: 1.6;
}

.upload-area {
  :deep(.el-upload--picture-card) {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 1px dashed #dcdfe6;

    &:hover {
      border-color: #409EFF;
    }
  }
}

/* ===== 时间线卡片 ===== */
.timeline-card {
  .card-title {
    font-size: 14px;
    color: #303133;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .timeline {
    position: relative;
    padding-left: 12px;
  }

  /* 时间线节点 */
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    /* 圆点 */
    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dcdfe6;
      flex-shrink: 0;
      margin-top: 6px;
      position: relative;

      /* 当前节点高亮 */
      &.active {
        background: #409EFF;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
      }
    }

    .timeline-content {
      flex: 1;
      padding-bottom: 16px;

      .timeline-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .timeline-role {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        /* 审批人头像 */
        .timeline-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #409EFF;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .timeline-name {
        font-size: 13px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }

  /* 会签连接线 */
  .timeline-connector {
    display: flex;
    align-items: center;
    padding-left: 5px;
    margin: -8px 0;

    .connector-line {
      width: 2px;
      height: 24px;
      background: #409EFF;
      margin-right: 8px;
    }

    .connector-label {
      display: flex;
      align-items: center;
      gap: 8px;

      .dashed-line {
        width: 80px;
        height: 1px;
        border-top: 2px dashed #dcdfe6;
      }

      .connector-text {
        font-size: 12px;
        color: #c0c4cc;
      }
    }
  }
}

/* ==================== 底部提交按钮 ==================== */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 100;

  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
    border: none;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}
</style>
