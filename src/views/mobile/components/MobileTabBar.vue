<!--
  MobileTabBar.vue - 移动端通用底部标签栏组件
  
  功能说明：
  - 固定底部的标签导航栏
  - 支持 2-5 个标签项
  - 激活状态蓝色高亮 + 底部下划线
  - 点击标签切换路由
  
  Props:
  - tabs: 标签配置数组 [{label, icon, route}]
  - activeIndex: 当前激活的标签索引
-->
<script setup>
/**
 * 移动端底部标签栏
 * @description 固定底部的标签导航，支持路由切换
 */
import { useRouter } from 'vue-router'
import { Check, Document } from '@element-plus/icons-vue'

// ===== Props 定义 =====
const props = defineProps({
  /** 标签配置数组 */
  tabs: {
    type: Array,
    required: true,
    // 每项格式: { label: '标签文字', icon: '图标名', route: '/路由路径' }
    default: () => []
  },
  /** 当前激活的标签索引 */
  activeIndex: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

/**
 * 处理标签点击
 * @param {Object} tab - 标签配置对象
 * @param {Number} index - 标签索引
 */
const handleTabClick = (tab, index) => {
  if (index === props.activeIndex) return  // 点击当前标签不操作
  if (tab.route) {
    router.push(tab.route)
  }
}
</script>

<template>
  <!-- 底部标签栏容器 -->
  <div class="mobile-tab-bar">
    <!-- 遍历标签项 -->
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      class="mobile-tab-bar__item"
      :class="{ 'is-active': index === activeIndex }"
      @click="handleTabClick(tab, index)"
    >
      <!-- 标签文字 -->
      <span class="mobile-tab-bar__label">{{ tab.label }}</span>
      
      <!-- 激活状态下划线 -->
      <div v-if="index === activeIndex" class="mobile-tab-bar__indicator"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/mobile-variables.scss';

/* 底部标签栏容器 */
.mobile-tab-bar {
  @include fixed-center;
  bottom: 0;
  height: $mobile-tab-height;
  background: $mobile-card-bg;
  display: flex;
  align-items: stretch;
  border-top: 1px solid $mobile-border-light;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  
  /* 桌面端手机模拟框适配 */
  @media (min-width: 768px) {
    bottom: 30px;  // 与容器的 margin-bottom 一致
    border-radius: 0 0 32px 32px;
  }
  
  /* 安全区域适配（iPhone 底部） */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* 单个标签项 */
  &__item {
    flex: 1;
    @include flex-center;
    position: relative;
    cursor: pointer;
    color: $mobile-text-secondary;
    font-size: $mobile-font-size-base;
    transition: color 0.3s ease;
    @include tap-active;
    
    /* 激活状态 */
    &.is-active {
      color: $mobile-primary;
      font-weight: 600;
    }
  }
  
  /* 标签文字 */
  &__label {
    @include text-ellipsis;
    padding: 0 8px;
  }
  
  /* 激活状态下划线指示器 */
  &__indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background: $mobile-primary;
    border-radius: 2px;
  }
}
</style>
