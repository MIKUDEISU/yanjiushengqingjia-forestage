<!--
  MobileHeader.vue - 移动端通用顶部导航栏组件
  
  功能说明：
  - 蓝色背景 (#409EFF) 的固定顶部导航
  - 左侧返回箭头按钮（可选显示）
  - 居中显示标题文字
  - 适配桌面端手机模拟框效果
  
  Props:
  - title: 标题文字（必填）
  - showBack: 是否显示返回按钮，默认 true
  
  Events:
  - back: 点击返回按钮时触发（默认执行 router.back()）
-->
<script setup>
/**
 * 移动端通用顶部导航栏
 * @description 蓝色背景固定顶部导航，支持返回按钮和标题
 */
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

// ===== Props 定义 =====
const props = defineProps({
  /** 页面标题 */
  title: {
    type: String,
    required: true,
    default: ''
  },
  /** 是否显示返回按钮 */
  showBack: {
    type: Boolean,
    default: true
  }
})

// ===== Events 定义 =====
const emit = defineEmits(['back'])

const router = useRouter()

/**
 * 处理返回按钮点击
 * 优先触发 back 事件，如果没有监听则使用路由返回
 */
const handleBack = () => {
  if (emit('back')) return
  // 如果没有自定义处理，默认路由返回
  router.back()
}
</script>

<template>
  <!-- 顶部导航栏容器 -->
  <div class="mobile-header">
    <!-- 左侧：返回按钮区域 -->
    <div class="mobile-header__left" @click="handleBack" v-if="showBack">
      <el-icon :size="20">
        <ArrowLeft />
      </el-icon>
    </div>
    
    <!-- 左侧占位（不显示返回按钮时保持标题居中） -->
    <div class="mobile-header__left" v-else></div>
    
    <!-- 中间：标题文字 -->
    <div class="mobile-header__title">
      {{ title }}
    </div>
    
    <!-- 右侧：预留扩展区域 -->
    <div class="mobile-header__right">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/mobile-variables.scss';

/* 顶部导航栏容器 */
.mobile-header {
  @include fixed-center;
  top: 0;
  height: $mobile-header-height;
  background: $mobile-header-bg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-shadow: $mobile-header-shadow;
  
  /* 桌面端手机模拟框适配 */
  @media (min-width: 768px) {
    top: 30px;  // 与容器的 margin-top 一致
    border-radius: 32px 32px 0 0;
  }
  
  /* 左侧区域（返回按钮） */
  &__left {
    width: 44px;
    height: 44px;
    @include flex-center;
    color: #ffffff;
    cursor: pointer;
    border-radius: 50%;
    @include tap-active;
    
    /* 触摸反馈 */
    &:active {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  /* 标题文字 */
  &__title {
    flex: 1;
    text-align: center;
    color: #ffffff;
    font-size: $mobile-font-size-lg;
    font-weight: 600;
    @include text-ellipsis;
    letter-spacing: 1px;
  }
  
  /* 右侧区域（预留插槽） */
  &__right {
    width: 44px;
    height: 44px;
    @include flex-center;
    color: #ffffff;
  }
}
</style>
