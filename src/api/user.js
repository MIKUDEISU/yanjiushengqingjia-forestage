import request from "@/utils/request";

// 登录
export const loginService = (loginData) => request.post('/api/auth/login', loginData)

// 获取用户信息
export const userInfoService = () => request.get('/api/auth/userInfo')
export const _login =(user) => request.post('/api/user/login', user)//登录
