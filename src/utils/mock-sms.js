export function sendMockSMS(phone, studentName, duration, action, reason = '') {
  const actionText = {
    approved: '通过',
    rejected: '拒绝',
    returned: '驳回修改'
  }

  const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  const actionStr = actionText[action] || action

  let message = `【学校通知】尊敬的家长您好，您的孩子${studentName}申请请假${duration}天，审批结果：${actionStr}。`

  if (action === 'rejected' && reason) {
    message += `拒绝原因：${reason}。`
  }
  if (action === 'returned' && reason) {
    message += `驳回原因：${reason}，请修改后重新提交。`
  }
  if (action === 'approved') {
    message += '请关注孩子的离校与返校安排，如有疑问请联系辅导员。'
  }

  const timestamp = new Date().toLocaleString('zh-CN')
  const smsLog = {
    phone: maskedPhone,
    message,
    timestamp,
    status: 'sent'
  }

  console.log('═══════════════════════════════════')
  console.log('【模拟短信发送】')
  console.log(`   收件人：${maskedPhone}`)
  console.log(`   发送时间：${timestamp}`)
  console.log(`   短信内容：${message}`)
  console.log(`   发送状态：已发送`)
  console.log('═══════════════════════════════════')

  return smsLog
}

export function generateSMSPreview(studentName, duration, action) {
  const actionText = {
    approved: '通过',
    rejected: '拒绝',
    returned: '驳回修改'
  }
  return `【学校通知】尊敬的家长您好，您的孩子${studentName}申请请假${duration}天，审批结果：${actionText[action]}。请关注孩子的离校与返校安排，如有疑问请联系辅导员。`
}
