import request from "@/utils/request";

// 请假申请API模块
// 提供请假、审批相关的所有API调用

/**
 * 分页查询请假申请列表
 * @param {Object} params - 查询参数 {pageNo, pageSize, userName, userId, leaveType, status, startTimeBegin, startTimeEnd}
 * @returns {Promise} 请假申请列表
 */
export const getLeaveList = (params) => request.get('/api/leave/pageList', { params })

/**
 * 查询请假申请详情
 * @param {Number} id - 请假申请ID
 * @returns {Promise} 请假申请详情（含地址、审批流程）
 */
export const getLeaveDetail = (id) => request.get(`/api/leave/detail/${id}`)

/**
 * 提交请假申请
 * @param {Object} leaveApplication - 请假申请信息
 * @param {Array} addressIds - 地址ID列表（可选）
 * @returns {Promise} 提交结果
 */
export const submitLeaveApplication = (leaveApplication, addressIds) => {
  const params = addressIds ? { addressIds } : {}
  return request.post('/api/leave/submit', leaveApplication, { params })
}

/**
 * 审批请假申请（同意）
 * @param {Object} data - 审批请求 {leaveId, approverId, comment}
 * @returns {Promise} 审批结果
 */
export const approveLeave = (data) => request.post('/api/leave/approve', data)

/**
 * 审批请假申请（拒绝）
 * @param {Object} data - 审批请求 {leaveId, approverId, comment}
 * @returns {Promise} 审批结果
 */
export const rejectLeave = (data) => request.post('/api/leave/reject', data)

/**
 * 获取待审批数量
 * @param {Number} approverId - 审批人ID
 * @returns {Promise} 待审批数量
 */
export const getPendingCount = (approverId) => request.get('/api/leave/pendingCount', { params: { approverId } })

/**
 * 删除请假申请
 * @param {Number} id - 请假申请ID
 * @returns {Promise} 删除结果
 */
export const deleteLeave = (id) => request.delete(`/api/leave/delete/${id}`)

/**
 * 模拟数据：获取审批申请列表（测试用）
 * @returns {Promise} 模拟的审批列表
 */
export const getMockApprovalList = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        name: '张小白',
        studentId: '2020090911004',
        leaveType: '回家',
        applyTime: '2022-11-26 17:56:32',
        startTime: '2022-11-26 17:56:32',
        endTime: '2022-11-26 17:56:32',
        reason: '回家取东西回家取东西回家取东西回家取东西回家取东西回家取东西',
        status: 'pending',
        avatarInitial: '张'
      }
    ]
  })
}