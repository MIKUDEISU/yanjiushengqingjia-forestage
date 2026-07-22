import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/index.js'

function calcDuration(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end - start) / 86400000) + 1
}

function buildTimeline(item) {
  if (item.approvals && Array.isArray(item.approvals) && item.approvals.length > 0) {
    return item.approvals.map(r => ({
      time: r.created_at || '',
      title: r.action === 'approve' ? '审批通过' :
             r.action === 'reject' ? '审批拒绝' :
             r.action === 'reject_back' ? '驳回修改' : r.action || '审批操作',
      desc: r.comment || '',
      status: r.action === 'reject' ? 'error' : 'done'
    }))
  }

  if (item.approval_timeline) {
    let timeline = item.approval_timeline
    if (typeof timeline === 'string') {
      try {
        timeline = JSON.parse(timeline)
      } catch (e) {
        return []
      }
    }
    if (Array.isArray(timeline) && timeline.length > 0) {
      return timeline.map(t => ({
        time: t.time || t.created_at || '',
        title: t.title || t.action || '',
        desc: t.desc || t.comment || '',
        status: t.status || 'done'
      }))
    }
  }

  return []
}

function buildDestinations(leaveData) {
  const dests = []
  if (leaveData.destination) {
    dests.push({
      city: leaveData.destination,
      address: leaveData.destinationDetail || ''
    })
  }
  if (leaveData.extraDestinations && Array.isArray(leaveData.extraDestinations)) {
    for (const d of leaveData.extraDestinations) {
      if (d.text) {
        dests.push({
          province: d.province || '',
          city: d.text || d.city || '',
          district: d.district || '',
          address: d.address || ''
        })
      }
    }
  }
  return dests
}

function mapLeaveFromAPI(item) {
  if (!item) return null

  let stage = 'initial'
  let returnStatus = item.return_status || null
  let delayStatus = null

  if (item.type === 'return' || (item.status === 'approved' && item.return_status === 'pending')) {
    stage = 'return'
    returnStatus = item.return_status || item.status || 'pending'
  } else if (item.type === 'delay' || (item.status === 'approved' && item.delay_status === 'pending')) {
    stage = 'delay'
    delayStatus = item.delay_status || item.status || 'pending'
  }

  let dests = item.destinations
  if (typeof dests === 'string') {
    try { dests = JSON.parse(dests) } catch { dests = [] }
  }
  if (!Array.isArray(dests)) dests = []

  return {
    id: item.id,
    studentName: item.student_name || '',
    studentId: item.student_no || item.student_id || '',
    className: item.grade || '',
    department: item.college || '',
    leaveType: item.leave_type || '',
    startDate: item.leave_start_date || '',
    endDate: item.leave_end_date || '',
    duration: item.leave_days || 0,
    reason: item.leave_reason || '',
    status: item.status || 'pending',
    stage,
    returnStatus,
    delayStatus,
    overdueDays: item.overdue_days || 0,
    rejectReason: item.reject_reason || item.rejectReason || '',
    timeline: buildTimeline(item),
    currentApprover: item.current_approver || null,
    currentStep: item.current_level || 0,
    totalSteps: item.total_levels || 1,
    urgency: item.urgency || '普通',
    leavingXiAn: !!item.leave_xian,
    destination: dests.map(d => (d.province || '') + (d.city || '') + (d.district || '') + (d.address ? ' ' + d.address : '')).join('; '),
    destinations: dests,
    emergencyContactName: item.emergency_contact_name || '',
    parentPhone: item.emergency_contact_phone || item.student_phone || '',
    studentPhone: item.student_phone || '',
    attachments: (item.attachments || []).map(a => ({
      filename: a.filename || a.original_name || '',
      originalName: a.original_name || a.filename || '',
      filePath: a.file_path || a.path || ''
    })),
    smsSent: !!item.sms_sent,
    approvals: item.approvals || [],
    leaveId: item.leave_id || item.id,
    delayReason: item.delay_reason || '',
    delayDays: item.delay_days || 0,
    newReturnDate: item.new_return_date || '',
    returnType: item.return_type || 'normal',
    passCode: item.pass_code || ''
  }
}

export const useLeaveStore = defineStore('leave', () => {
  const leaves = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const detailCache = ref({})

  const allLeaves = computed(() => leaves.value)

  const pendingLeaves = computed(() => {
    return leaves.value.filter(l => l.status === 'pending' || l.status === 'processing')
  })

  const completedLeaves = computed(() => {
    return leaves.value.filter(l => l.status === 'approved' || l.status === 'rejected')
  })

  function isPendingApproval(leave) {
    if (leave.status === 'pending' || leave.status === 'processing') return true
    if (leave.status === 'approved') {
      if (leave.stage === 'return' && leave.returnStatus === 'processing') return true
      if (leave.stage === 'delay' && leave.delayStatus === 'processing') return true
      if (leave.type === 'return' && leave.status === 'pending') return true
      if (leave.type === 'delay' && leave.status === 'pending') return true
    }
    return false
  }

  async function fetchLeaves(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/student/leaves', {
        page: params.page || page.value,
        page_size: params.pageSize || pageSize.value,
        ...params
      })
      if (res.code === 200) {
        const list = (res.data.list || []).map(mapLeaveFromAPI)
        leaves.value = list
        total.value = res.data.total || 0
        page.value = res.data.page || 1
        return { success: true, data: res.data }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingLeaves() {
    return fetchLeaves({ status: 'pending', page_size: 100 })
  }

  async function fetchLeaveDetail(id) {
    try {
      const res = await api.get(`/student/leaves/${id}`)
      if (res.code === 200) {
        const detail = mapLeaveFromAPI(res.data)
        detailCache.value[id] = detail
        return { success: true, data: detail }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  function getLeaveById(id) {
    if (detailCache.value[id]) return detailCache.value[id]
    return leaves.value.find(l => l.id === id)
  }

  async function submitLeave(leaveData) {
    try {
      const body = {
        leave_type: leaveData.leaveType,
        leave_start_date: leaveData.startDate,
        leave_end_date: leaveData.endDate,
        leave_reason: leaveData.reason,
        urgency: leaveData.urgency || '普通',
        leave_xian: leaveData.leavingXiAn || false,
        student_phone: leaveData.studentPhone || leaveData.parentPhone || '',
        emergency_contact_name: leaveData.emergencyContactName || '家长',
        emergency_contact_phone: leaveData.parentPhone || leaveData.emergencyContactPhone || '',
        destinations: leaveData.leavingXiAn
          ? buildDestinations(leaveData)
          : []
      }

      const res = await api.post('/student/leaves', body)
      if (res.code === 201 || res.code === 200) {
        await fetchLeaves()
        const detail = mapLeaveFromAPI(res.data)
        detailCache.value[detail.id] = detail
        return { success: true, data: detail }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function fetchApprovalList(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/admin/approvals', params)
      if (res.code === 200) {
        const list = (res.data.list || res.data || []).map(mapLeaveFromAPI)
        leaves.value = list
        total.value = res.data.total || list.length
        return { success: true, data: res.data, list }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchApprovalsByType(type, params = {}) {
    try {
      const res = await api.get('/admin/approvals', { ...params, type })
      if (res.code === 200) {
        const list = (res.data.list || res.data || []).map(mapLeaveFromAPI)
        return { success: true, list, total: res.data.total || list.length }
      }
      return { success: false, message: res.message, list: [] }
    } catch (err) {
      return { success: false, message: err.message, list: [] }
    }
  }

  async function fetchApprovalDetail(type, id) {
    try {
      const res = await api.get(`/admin/approvals/${type}/${id}`)
      if (res.code === 200) {
        const detail = mapLeaveFromAPI(res.data)
        detailCache.value[id] = detail
        return { success: true, data: detail }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function processApproval(type, id, action, comment = '') {
    try {
      const body = { action }
      if (comment) body.comment = comment
      const res = await api.post(`/admin/approvals/${type}/${id}/process`, body)
      if (res.code === 200) {
        const detail = mapLeaveFromAPI(res.data)
        detailCache.value[id] = detail
        const idx = leaves.value.findIndex(l => l.id === id)
        if (idx !== -1) leaves.value[idx] = detail
        return { success: true, data: detail }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function approveLeave(id, comment = '') {
    return processApproval('leave', id, 'approve', comment)
  }

  async function rejectLeave(id, comment = '') {
    return processApproval('leave', id, 'reject', comment)
  }

  async function returnBackLeave(id, comment = '') {
    return processApproval('leave', id, 'reject_back', comment)
  }

  async function applyReturn(leaveId) {
    try {
      const res = await api.post('/student/return', { leave_id: leaveId })
      if (res.code === 201 || res.code === 200) {
        return { success: true, data: res.data }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function approveReturn(id) {
    return processApproval('return', id, 'approve')
  }

  async function rejectReturn(id, comment = '') {
    return processApproval('return', id, 'reject', comment)
  }

  async function applyDelay(leaveId, delayDays, delayReason) {
    try {
      const res = await api.post('/student/delay', {
        leave_id: leaveId,
        delay_days: delayDays,
        delay_reason: delayReason
      })
      if (res.code === 201 || res.code === 200) {
        return { success: true, data: res.data }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function approveDelay(id) {
    return processApproval('delay', id, 'approve')
  }

  async function rejectDelay(id, comment = '') {
    return processApproval('delay', id, 'reject', comment)
  }

  return {
    leaves, total, page, pageSize, loading, detailCache,
    allLeaves, pendingLeaves, completedLeaves,
    isPendingApproval, getLeaveById,
    fetchLeaves, fetchPendingLeaves, fetchLeaveDetail,
    fetchApprovalList, fetchApprovalsByType, fetchApprovalDetail,
    submitLeave,
    approveLeave, rejectLeave, returnBackLeave, processApproval,
    applyReturn, approveReturn, rejectReturn,
    applyDelay, approveDelay, rejectDelay
  }
})
