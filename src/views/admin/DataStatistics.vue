<template>
  <div class="page-container">
    <header class="view-header"><h1>数据统计</h1></header>

    <van-loading v-if="loading" class="loading-center" size="24" text="加载中..." />

    <div class="stats-page" v-else>
      <div class="overview-row">
        <div class="stat-card">
          <div class="stat-card__value">{{ overview.total }}</div>
          <div class="stat-card__label">请假总人次</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color: #F59E0B;">{{ overview.active }}</div>
          <div class="stat-card__label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color: #EF4444;">{{ overview.overdue }}</div>
          <div class="stat-card__label">超时未归</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color: #10B981;">{{ overview.today }}</div>
          <div class="stat-card__label">今日请假</div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">📊 请假类型分布</div>
        <div class="bar-chart">
          <div class="bar-item" v-for="(item, idx) in typeData" :key="item.name">
            <div class="bar-label">
              <span>{{ item.name }}</span>
              <span class="bar-count">{{ item.value }}人次</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: maxTypeVal ? (item.value / maxTypeVal * 100) + '%' : '0%', background: barColors[idx % barColors.length] }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">🥧 留校与离校占比</div>
        <div class="pie-section">
          <div class="pie-item" v-for="(item, idx) in stayLeaveData" :key="item.name">
            <div class="pie-legend">
              <span class="pie-dot" :style="{ background: pieColors[idx] }"></span>
              <span>{{ item.name }}</span>
            </div>
            <div class="pie-bar-wrap">
              <div class="pie-bar" :style="{ width: stayLeaveTotal ? (item.value / stayLeaveTotal * 100) + '%' : '0%', background: pieColors[idx] }"></div>
              <span class="pie-val">{{ stayLeaveTotal ? Math.round(item.value / stayLeaveTotal * 100) : 0 }}% ({{ item.value }}人)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">🏫 各学院请假/返校人数对比</div>
        <div class="college-compare" v-if="collegeData.length">
          <div class="college-item" v-for="(item, idx) in collegeData" :key="item.name">
            <div class="college-name">{{ item.name }}</div>
            <div class="college-bars">
              <div class="college-bar-row">
                <span class="college-bar-label">请假</span>
                <div class="bar-track bar-track--small" style="flex:1">
                  <div class="bar-fill" :style="{ width: maxCollege ? (item.leave_count / maxCollege * 100) + '%' : '0%', background: '#3B82F6' }"></div>
                </div>
                <span class="college-bar-num">{{ item.leave_count }}</span>
              </div>
              <div class="college-bar-row">
                <span class="college-bar-label">返校</span>
                <div class="bar-track bar-track--small" style="flex:1">
                  <div class="bar-fill" :style="{ width: maxCollege ? (item.return_count / maxCollege * 100) + '%' : '0%', background: '#10B981' }"></div>
                </div>
                <span class="college-bar-num">{{ item.return_count }}</span>
              </div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无数据" />
      </div>

      <div class="chart-container">
        <div class="chart-title">🗺️ 离校目的地省份分布（当前未返校）</div>
        <div class="dest-tags" v-if="destinationData.length">
          <van-tag
            v-for="(item, idx) in destinationData"
            :key="item.name"
            :style="{ fontSize: Math.min(14 + item.value * 2, 22) + 'px', margin: '4px' }"
            :color="tagColors[idx % tagColors.length]"
            size="large"
          >
            {{ item.name }} {{ item.value }}人
          </van-tag>
        </div>
        <van-empty v-else description="暂无目的地数据" />
      </div>

      <div class="chart-container">
        <div class="chart-title">🏆 请假次数排名（年度）</div>
        <div class="rank-list" v-if="rankingData.length">
          <div class="rank-item" v-for="(item, idx) in rankingData" :key="item.student_no">
            <div class="rank-num">
              <span v-if="idx === 0">🥇</span>
              <span v-else-if="idx === 1">🥈</span>
              <span v-else-if="idx === 2">🥉</span>
              <span v-else class="rank-num-text">{{ idx + 1 }}</span>
            </div>
            <div class="rank-info">
              <div class="rank-name">{{ item.name }}</div>
              <div class="rank-college">{{ item.college }}</div>
            </div>
            <div class="rank-stats">
              <div class="rank-count">{{ item.leave_count }}次</div>
              <div class="rank-days">{{ item.total_days }}天</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无排名数据" />
      </div>

      <div class="chart-container">
        <div class="chart-title">⚠️ 超时未归统计</div>
        <div class="overdue-summary" v-if="overdueStats">
          <div class="overdue-stat">
            <span class="overdue-num">{{ overdueStats.total }}</span>
            <span class="overdue-label">总超时人数</span>
          </div>
          <div class="overdue-stat">
            <span class="overdue-num" style="color:#10B981">{{ overdueStats.applied_return }}</span>
            <span class="overdue-label">已申请返校</span>
          </div>
          <div class="overdue-stat">
            <span class="overdue-num" style="color:#EF4444">{{ overdueStats.not_applied_return }}</span>
            <span class="overdue-label">未申请返校</span>
          </div>
        </div>
        <div class="overdue-list" v-if="overdueStats && overdueStats.list && overdueStats.list.length">
          <div class="overdue-item" v-for="item in overdueStats.list" :key="item.student_no">
            <div class="overdue-info">
              <span class="overdue-name">{{ item.student_name }}</span>
              <span class="overdue-college">{{ item.college }}</span>
            </div>
            <div class="overdue-detail">
              <span>超时 {{ item.overdue_days }}天</span>
              <van-tag :type="item.has_return_applied ? 'success' : 'danger'" size="small">
                {{ item.has_return_applied ? '已申请返校' : '未申请' }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">📈 请假时长区间分布</div>
        <div class="bar-chart">
          <div class="bar-item" v-for="(item, idx) in durationData" :key="item.name">
            <div class="bar-label">
              <span>{{ item.name }}</span>
              <span class="bar-count">{{ item.value }}人次</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: maxDurVal ? (item.value / maxDurVal * 100) + '%' : '0%', background: barColors[idx % barColors.length] }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/index.js'
import { showToast } from 'vant'

const loading = ref(true)

const barColors = ['#2563EB', '#3B82F6', '#60A5FA', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const pieColors = ['#3B82F6', '#10B981']
const tagColors = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

const overview = ref({ total: 0, active: 0, overdue: 0, today: 0 })
const typeData = ref([])
const stayLeaveData = ref([])
const collegeData = ref([])
const destinationData = ref([])
const rankingData = ref([])
const overdueStats = ref(null)
const durationData = ref([])

const maxTypeVal = computed(() => Math.max(...typeData.value.map(d => d.value), 1))
const maxDurVal = computed(() => Math.max(...durationData.value.map(d => d.value), 1))
const stayLeaveTotal = computed(() => stayLeaveData.value.reduce((s, d) => s + d.value, 0))
const maxCollege = computed(() => {
  const all = collegeData.value.flatMap(d => [d.leave_count, d.return_count])
  return Math.max(...all, 1)
})

async function fetchAllStats() {
  try {
    const [
      overviewRes, typeRes, stayLeaveRes, collegeRes,
      destRes, rankingRes, overdueRes, durationRes
    ] = await Promise.all([
      api.get('/statistics/overview'),
      api.get('/statistics/leave-types'),
      api.get('/statistics/stay-leave-ratio'),
      api.get('/statistics/colleges'),
      api.get('/statistics/destinations'),
      api.get('/statistics/student-ranking', { period: 'year', page_size: 20 }),
      api.get('/statistics/overdue'),
      api.get('/statistics/duration')
    ])

    if (overviewRes.code === 200) overview.value = overviewRes.data
    if (typeRes.code === 200) typeData.value = typeRes.data || []
    if (stayLeaveRes.code === 200) stayLeaveData.value = stayLeaveRes.data || []
    if (collegeRes.code === 200) collegeData.value = collegeRes.data || []
    if (destRes.code === 200) destinationData.value = destRes.data || []
    if (rankingRes.code === 200) rankingData.value = rankingRes.data.list || []
    if (overdueRes.code === 200) overdueStats.value = overdueRes.data
    if (durationRes.code === 200) durationData.value = durationRes.data || []
  } catch (err) {
    showToast({ message: '加载统计数据失败: ' + err.message, icon: 'fail' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchAllStats)
</script>

<style scoped>
.stats-page { padding-bottom: 30px; }
.loading-center { display: flex; justify-content: center; padding: 80px; }

.overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px 24px;
  max-width: 1100px;
}
.stat-card { text-align: center; background: #fff; border-radius: 8px; padding: 12px 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-card__value { font-size: 22px; font-weight: 700; color: #2563EB; line-height: 1; margin-bottom: 4px; }
.stat-card__label { font-size: 11px; color: #999; }

.chart-container { background: #fff; border-radius: 10px; margin: 10px 12px; padding: 14px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
.chart-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }

.bar-chart { display: flex; flex-direction: column; gap: 12px; }
.bar-label { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 4px; }
.bar-count { font-weight: 600; color: #333; }
.bar-track { height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
.bar-track--small { height: 8px; }
.bar-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; min-width: 3px; }

.pie-section { display: flex; flex-direction: column; gap: 10px; }
.pie-item { display: flex; align-items: center; gap: 10px; }
.pie-legend { display: flex; align-items: center; gap: 6px; min-width: 120px; font-size: 13px; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; }
.pie-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
.pie-bar { height: 14px; border-radius: 7px; min-width: 2px; transition: width 0.6s; }
.pie-val { font-size: 12px; color: #666; white-space: nowrap; }

.college-compare { display: flex; flex-direction: column; gap: 10px; }
.college-item { font-size: 13px; }
.college-name { font-weight: 600; margin-bottom: 4px; color: #333; }
.college-bars { display: flex; flex-direction: column; gap: 3px; }
.college-bar-row { display: flex; align-items: center; gap: 8px; }
.college-bar-label { font-size: 11px; color: #999; min-width: 28px; }
.college-bar-num { font-size: 12px; font-weight: 600; min-width: 24px; text-align: right; }

.dest-tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0; }

.rank-list { display: flex; flex-direction: column; gap: 8px; }
.rank-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: #f9fafb; border-radius: 8px; }
.rank-num { font-size: 22px; min-width: 32px; text-align: center; }
.rank-num-text { font-size: 16px; font-weight: 700; color: #999; }
.rank-info { flex: 1; }
.rank-name { font-size: 14px; font-weight: 500; }
.rank-college { font-size: 11px; color: #999; }
.rank-stats { text-align: right; }
.rank-count { font-size: 15px; font-weight: 700; color: #2563EB; }
.rank-days { font-size: 11px; color: #999; }

.overdue-summary { display: flex; gap: 10px; margin-bottom: 10px; }
.overdue-stat { flex: 1; text-align: center; padding: 8px; background: #f9fafb; border-radius: 6px; }
.overdue-num { font-size: 20px; font-weight: 700; color: #EF4444; display: block; }
.overdue-label { font-size: 11px; color: #999; }

.overdue-list { display: flex; flex-direction: column; gap: 8px; }
.overdue-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #fef2f2; border-radius: 6px; font-size: 13px; }
.overdue-info { display: flex; gap: 6px; }
.overdue-name { font-weight: 500; }
.overdue-college { color: #999; }
.overdue-detail { display: flex; align-items: center; gap: 8px; color: #EF4444; font-weight: 500; }
</style>
