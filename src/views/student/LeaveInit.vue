<template>
  <div class="page-container">
    <header class="view-header"><h1>请假申请</h1></header>

    <div class="leave-init">
      <div class="steps-header">
        <div class="step-item active">
          <div class="step-circle">1</div>
          <div class="step-label">填写信息</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <div class="step-circle">2</div>
          <div class="step-label">确认提交</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <div class="step-circle">3</div>
          <div class="step-label">等待审批</div>
        </div>
      </div>

      <van-form @submit="onSubmit" scroll-to-error>
        <van-cell-group inset title="基本信息">
          <van-field
            v-model="form.studentName"
            label="姓名"
            placeholder="自动获取"
            readonly
          />
          <van-field
            v-model="form.studentId"
            label="学号"
            placeholder="自动获取"
            readonly
          />
          <van-field
            v-model="form.className"
            label="班级"
            placeholder="自动获取"
            readonly
          />
        </van-cell-group>

        <van-cell-group inset title="请假信息">
          <van-field
            v-model="form.leaveType"
            is-link
            readonly
            label="请假类型"
            placeholder="请选择请假类型"
            :rules="[{ required: true, message: '请选择请假类型' }]"
            @click="showTypePicker = true"
          />
          <van-field
            v-model="form.startDate"
            is-link
            readonly
            label="开始日期"
            placeholder="请选择开始日期"
            :rules="[{ required: true, message: '请选择开始日期' }]"
            @click="showStartPicker = true"
          />
          <van-field
            v-model="form.endDate"
            is-link
            readonly
            label="结束日期"
            placeholder="请选择结束日期"
            :rules="[{ required: true, message: '请选择结束日期' }]"
            @click="showEndPicker = true"
          />
          <van-field
            v-model="form.durationText"
            label="请假天数"
            readonly
          >
            <template #extra>
              <span class="duration-badge">{{ form.durationText || '待计算' }}</span>
            </template>
          </van-field>
          <van-field
            v-model="form.urgency"
            is-link
            readonly
            label="紧急程度"
            placeholder="请选择紧急程度"
            @click="showUrgencyPicker = true"
          />
        </van-cell-group>

        <van-cell-group inset title="请假原因">
          <van-field
            v-model="form.reason"
            type="textarea"
            rows="4"
            :placeholder="form.leaveType === '病假' ? '请说明病情并上传医院证明…' : '请详细说明请假原因...'"
            :rules="[{ required: true, message: '请输入请假原因' }]"
            maxlength="100"
          >
            <template #extra>
              <span class="char-count" :class="{ 'char-count--warn': form.reason.length > 90 }">
                {{ form.reason.length }}/100
              </span>
            </template>
          </van-field>
          <div v-if="form.leaveType === '病假'" class="sick-leave-hint">
            <van-icon name="info-o" />
            <span>病假需上传医院开具的证明（病历、诊断书等），否则可能被驳回</span>
          </div>
        </van-cell-group>

        <van-cell-group inset title="出行信息">
          <div class="travel-radio">
            <span class="travel-radio__label">是否离开西安</span>
            <van-radio-group v-model="form.leavingXiAn" direction="horizontal" style="display: flex; gap: 20px;">
              <van-radio :name="true">是</van-radio>
              <van-radio :name="false">否</van-radio>
            </van-radio-group>
          </div>
          <van-field
            v-if="form.leavingXiAn"
            v-model="destinationText"
            is-link
            readonly
            label="目的地"
            placeholder="请选择省/市/区"
            :rules="[{ required: true, message: '请选择目的地' }]"
            @click="showDestinationPicker = true"
          />
          <van-field
            v-if="form.leavingXiAn"
            v-model="form.destinationDetail"
            label="详细地址"
            placeholder="请输入详细地址（如街道门牌号）"
            maxlength="100"
          />
          <div v-if="form.leavingXiAn && destinations.length < 3" class="add-dest-wrap">
            <van-button size="small" type="primary" plain @click="addDestination">
              + 添加目的地
            </van-button>
          </div>
          <div v-for="(dest, idx) in destinations" :key="idx" class="extra-destination">
            <div class="dest-header">
              <span>目的地 {{ idx + 2 }}</span>
              <van-icon name="delete-o" @click="removeDestination(idx)" />
            </div>
            <van-field
              v-model="dest.text"
              is-link
              readonly
              label="省/市/区"
              placeholder="请选择"
              @click="openExtraDestPicker(idx)"
            />
            <van-field
              v-model="dest.address"
              label="详细地址"
              placeholder="请输入详细地址"
              maxlength="100"
            />
          </div>
        </van-cell-group>

        <van-cell-group inset title="联系信息">
          <van-field
            v-model="form.studentPhone"
            label="本人电话"
            placeholder="请输入本人联系电话"
            type="tel"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入本人电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]"
          />
          <van-field
            v-model="form.emergencyContactName"
            label="紧急联系人"
            placeholder="请输入紧急联系人姓名"
            :rules="[{ required: true, message: '请输入紧急联系人' }]"
          />
          <van-field
            v-model="form.parentPhone"
            label="联系人电话"
            placeholder="请输入紧急联系人电话"
            type="tel"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入联系人电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]"
          />
        </van-cell-group>

        <van-cell-group inset title="附件材料">
          <div class="attachment-area">
            <van-uploader
              v-model="form.attachments"
              :max-count="5"
              :max-size="2 * 1024 * 1024"
              accept="image/*,.pdf"
              upload-text="上传证明"
              :before-read="beforeReadAttachment"
            />
            <div class="attachment-hint">支持图片和PDF，单文件不超过2MB</div>
            <div v-if="form.leaveType === '病假'" class="attachment-required">
              ⚠️ 病假必须上传医院证明，否则可能被驳回
            </div>
          </div>
        </van-cell-group>

        <div style="margin: 20px 16px;">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            提交请假申请
          </van-button>
        </div>
      </van-form>

      <van-popup v-model:show="showTypePicker" position="bottom" round>
        <van-picker
          :columns="leaveTypeColumns"
          @confirm="onConfirmType"
          @cancel="showTypePicker = false"
          title="选择请假类型"
        />
      </van-popup>

      <van-popup v-model:show="showStartPicker" position="bottom" round>
        <van-date-picker
          v-model="currentStartDate"
          title="选择开始日期"
          :min-date="minDate"
          @confirm="onConfirmStart"
          @cancel="showStartPicker = false"
        />
      </van-popup>

      <van-popup v-model:show="showEndPicker" position="bottom" round>
        <van-date-picker
          v-model="currentEndDate"
          title="选择结束日期"
          :min-date="minDate"
          @confirm="onConfirmEnd"
          @cancel="showEndPicker = false"
        />
      </van-popup>

      <van-popup v-model:show="showUrgencyPicker" position="bottom" round>
        <van-picker
          :columns="urgencyColumns"
          @confirm="onConfirmUrgency"
          @cancel="showUrgencyPicker = false"
          title="选择紧急程度"
        />
      </van-popup>

      <van-popup v-model:show="showDestinationPicker" position="bottom" round>
        <van-cascader
          v-model="cascaderValue"
          title="选择省/市/区"
          :options="regionOptions"
          @close="showDestinationPicker = false"
          @finish="onFinishDestination"
        />
      </van-popup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useLeaveStore } from '@/stores/leave.js'
import { useAuthStore } from '@/stores/auth.js'
import { regionOptions } from '@/utils/regions.js'

const router = useRouter()
const leaveStore = useLeaveStore()
const authStore = useAuthStore()
const submitting = ref(false)

const form = reactive({
  studentName: '',
  studentId: '',
  className: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  durationText: '',
  reason: '',
  urgency: '',
  leavingXiAn: false,
  destination: '',
  destinationDetail: '',
  studentPhone: '',
  emergencyContactName: '',
  parentPhone: '',
  attachments: []
})

const destinations = ref([])
const editingDestIndex = ref(-1)

onMounted(() => {
  if (authStore.isLoggedIn && authStore.isStudent) {
    form.studentName = authStore.userName
    form.studentId = authStore.user?.studentId || authStore.user?.student_id || ''
    form.className = authStore.user?.className || authStore.user?.grade || ''
    form.studentPhone = authStore.user?.phone || ''
  }
})

const minDate = new Date()
const today = new Date()
const currentStartDate = ref([
  String(today.getFullYear()),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0')
])
const currentEndDate = ref([
  String(today.getFullYear()),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate() + 3).padStart(2, '0')
])

const showTypePicker = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const showUrgencyPicker = ref(false)
const showDestinationPicker = ref(false)
const cascaderValue = ref([])
const destinationText = ref('')

const leaveTypeColumns = [
  { text: '回家', value: '回家' },
  { text: '探亲', value: '探亲' },
  { text: '病假', value: '病假' },
  { text: '事假', value: '事假' },
  { text: '其他', value: '其他' }
]

const urgencyColumns = [
  { text: '普通', value: '普通' },
  { text: '紧急', value: '紧急' },
  { text: '特急', value: '特急' }
]

function formatDate(arr) {
  if (!arr || arr.length < 3) return ''
  return `${arr[0]}-${String(arr[1]).padStart(2, '0')}-${String(arr[2]).padStart(2, '0')}`
}

function dateArrToDate(arr) {
  if (!arr || arr.length < 3) return null
  const [y, m, d] = arr.map(Number)
  return new Date(y, m - 1, d)
}

function calcDurationDays() {
  const s = dateArrToDate(currentStartDate.value)
  const e = dateArrToDate(currentEndDate.value)
  if (s && e) {
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
  }
  return 0
}

function calcDuration() {
  const days = calcDurationDays()
  form.durationText = days > 0 ? `${days} 天` : ''
}

watch(() => form.startDate, () => calcDuration())
watch(() => form.endDate, () => calcDuration())
watch(() => form.leavingXiAn, (val) => {
  if (!val) {
    cascaderValue.value = []
    destinationText.value = ''
    form.destination = ''
    form.destinationDetail = ''
    destinations.value = []
  }
})

function onConfirmType({ selectedOptions }) {
  form.leaveType = selectedOptions[0]?.value || selectedOptions[0]?.text || ''
  showTypePicker.value = false
}

function onConfirmStart({ selectedValues }) {
  currentStartDate.value = [...selectedValues]
  form.startDate = formatDate(selectedValues)
  showStartPicker.value = false
}

function onConfirmEnd({ selectedValues }) {
  currentEndDate.value = [...selectedValues]
  form.endDate = formatDate(selectedValues)
  showEndPicker.value = false
}

function onConfirmUrgency({ selectedOptions }) {
  form.urgency = selectedOptions[0]?.value || selectedOptions[0]?.text || ''
  showUrgencyPicker.value = false
}

function onFinishDestination({ selectedOptions }) {
  showDestinationPicker.value = false
  const names = selectedOptions.map(o => o.text)
  destinationText.value = names.join('')
  form.destination = names.join('')

  const [province, city, district] = names
  if (editingDestIndex.value >= 0) {
    const dest = destinations.value[editingDestIndex.value]
    dest.text = names.join('')
    dest.province = province || ''
    dest.city = city || ''
    dest.district = district || ''
  }
  editingDestIndex.value = -1
}

function addDestination() {
  destinations.value.push({
    text: '',
    province: '',
    city: '',
    district: '',
    address: ''
  })
}

function removeDestination(idx) {
  destinations.value.splice(idx, 1)
}

function openExtraDestPicker(idx) {
  editingDestIndex.value = idx
  showDestinationPicker.value = true
}

function beforeReadAttachment(file) {
  if (file.size > 2 * 1024 * 1024) {
    showToast('文件大小不能超过2MB')
    return false
  }
  return true
}

async function onSubmit() {
  if (!form.startDate || !form.endDate) {
    showToast('请选择起止日期')
    return
  }

  const days = calcDurationDays()
  if (days <= 0) {
    showToast('结束日期必须在开始日期之后')
    return
  }

  if (days > 56) {
    showToast('请假天数不能超过56天（8周）')
    return
  }

  submitting.value = true

  const leaveData = {
    leaveType: form.leaveType,
    startDate: form.startDate,
    endDate: form.endDate,
    duration: days,
    reason: form.reason,
    urgency: form.urgency || '普通',
    leavingXiAn: form.leavingXiAn,
    destination: form.leavingXiAn ? form.destination : '',
    destinationDetail: form.leavingXiAn ? form.destinationDetail : '',
    studentPhone: form.studentPhone,
    emergencyContactName: form.emergencyContactName,
    parentPhone: form.parentPhone,
    extraDestinations: form.leavingXiAn ? destinations.value.map(d => ({
      text: d.text,
      province: d.province,
      city: d.city,
      district: d.district,
      address: d.address
    })) : [],
    attachments: form.attachments.map(f => (typeof f === 'string' ? f : f.name || f.url || '附件'))
  }

  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    const result = await leaveStore.submitLeave(leaveData)
    closeToast()

    if (result.success) {
      showToast({ message: '提交成功', icon: 'success' })
      setTimeout(() => {
        router.push('/student/history')
      }, 800)
    } else {
      showToast({ message: result.message || '提交失败', icon: 'fail' })
    }
  } catch (err) {
    closeToast()
    showToast({ message: err.message || '提交失败', icon: 'fail' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.leave-init {
  padding-bottom: 40px;
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px 16px;
  background: var(--color-bg-card);
  margin-bottom: 12px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: var(--color-primary);
  color: #fff;
}

.step-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.step-item.active .step-label {
  color: var(--color-primary);
  font-weight: 500;
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--color-border);
  margin: 0 8px 20px;
}

.duration-badge {
  color: var(--color-primary);
  font-weight: 600;
  font-size: var(--font-size-md);
}

.travel-radio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.travel-radio__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.attachment-area {
  padding: 12px 16px;
}

.attachment-hint {
  margin-top: 8px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.attachment-required {
  margin-top: 6px;
  font-size: var(--font-size-xs);
  color: #e74c3c;
  font-weight: 500;
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: 8px;
}

.char-count--warn {
  color: #e74c3c;
  font-weight: 600;
}

.sick-leave-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: var(--font-size-xs);
  color: #e67e22;
  background: #fef3e2;
  margin: 4px 16px;
  border-radius: 4px;
}

.add-dest-wrap {
  padding: 8px 16px;
}

.extra-destination {
  margin: 4px 16px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed var(--color-border);
}

.dest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
