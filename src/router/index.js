import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Layout from "@/views/Layout.vue";
import UserInfo from "@/views/user/UserInfo.vue";
import UserList from "@/views/user/UserList.vue";
import RestPassword from "@/views/user/RestPassword.vue";
// 请假模块路由
import LeaveApproval from "@/views/leave/LeaveApproval.vue";
import LeaveApplication from "@/views/leave/LeaveApplication.vue";
import {useUserInfoStore} from "@/stores/userInfo";



// 定义路由关系
const routes = [
  {path: '/login', component: Login},  // 一级路由
  {
    path: '/',
    redirect: '/login',  // 重定向
    component: Layout,
    // 子路由
    children: [
      {path: '/user/list', component: UserList},
      {path: '/user/info', component: UserInfo},
      {path: '/user/resetPassword', component: RestPassword},
    ]
  },
  // 请假审批页（管理端，仅老师可访问）
  {path: '/leave/approval', component: LeaveApproval, meta: {requireTeacher: true}},
  // 请假申请表（学生端，仅学生可访问）
  {path: '/leave/application', component: LeaveApplication, meta: {requireStudent: true}},
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(), // 路由模式
  routes: routes
})

/**
 * 路由守卫：根据用户remark字段控制页面访问权限
 * - 老师只能访问请假审批页
 * - 学生只能访问请假申请表
 */
router.beforeEach((to, from, next) => {
  const userInfoStore = useUserInfoStore();
  const remark = userInfoStore.userInfo?.remark || '';

  // 如果访问审批页但用户不是老师，重定向到申请表
  if (to.meta.requireTeacher && remark !== '老师') {
    if (remark === '学生') {
      next('/leave/application');
    } else {
      next('/login');
    }
  }
  // 如果访问申请表但用户不是学生，重定向到审批页
  else if (to.meta.requireStudent && remark !== '学生') {
    if (remark === '老师') {
      next('/leave/approval');
    } else {
      next('/login');
    }
  }
  else {
    next();
  }
})

//导出暴露
export default router
