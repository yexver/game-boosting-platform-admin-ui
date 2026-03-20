<template>
  <div class="dashboard-container">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="stat-card">
          <div class="stat-title">用户总数</div>
          <div class="stat-value">{{ userTotal }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card">
          <div class="stat-title">今日新增</div>
          <div class="stat-value">{{ userTodayNew }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增用户数折线图 和 游戏订单分布 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h3>新增用户数（近{{ userDays }}天）</h3>
            <el-input-number
              v-model="userDays"
              :min="1"
              :max="30"
              @change="fetchUserAddTrend"
              size="small"
            />
          </div>
          <v-chart :option="userAddOption" autoresize style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h3>游戏订单分布（近{{ gameDays }}天）</h3>
            <el-input-number
              v-model="gameDays"
              :min="1"
              :max="30"
              @change="fetchGameOrderDistribution"
              size="small"
            />
          </div>
          <v-chart :option="gameOrderOption" autoresize style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 平台收入统计 和 近三十天订单状态占比图 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h3>平台服务费收入趋势（近{{ incomeDays }}天）</h3>
            <el-input-number
              v-model="incomeDays"
              :min="1"
              :max="30"
              @change="fetchIncomeTrend"
              size="small"
            />
          </div>
          <v-chart :option="incomeOption" autoresize style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h3>近{{ orderPieDays }}天订单状态占比</h3>
            <el-input-number
              v-model="orderPieDays"
              :min="1"
              :max="30"
              @change="fetchOrderStatusPie"
              size="small"
            />
          </div>
          <v-chart
            :option="orderStatusPieOption"
            autoresize
            style="height: 300px"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VChart from 'vue-echarts'
import {
  getUserAddTrend,
  getGameOrderDistribution,
  getIncomeTrend,
  getOrderStatusPie,
  getUserStats,
} from '@/api/dashboard'

// 1. 新增用户数折线图 mock
const userAddOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: { type: 'value' },
  series: [{ name: '新增用户', type: 'line', data: [] }],
})

// 2. 游戏订单分布 mock
const gameOrderOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['订单数', '订单金额'] },
  xAxis: {
    type: 'category',
    data: ['王者荣耀', '原神', '火影忍者', '永劫无间'],
  },
  yAxis: { type: 'value' },
  series: [
    { name: '订单数', type: 'bar', data: [120, 90, 60, 30] },
    { name: '订单金额', type: 'bar', data: [3000, 2200, 1500, 800] },
  ],
})

// 3. 平台收入统计 mock
const incomeOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6', '7-7'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '服务费收入',
      type: 'line',
      data: [200, 300, 250, 400, 350, 500, 600],
    },
  ],
})

// 4. 近三十天订单状态占比 mock
const orderStatusPieData = [
  { value: 120, name: '已完成' },
  { value: 30, name: '异常' },
  { value: 20, name: '介入中' },
  { value: 10, name: '仲裁' },
  { value: 60, name: '待验收' },
  { value: 40, name: '代练中' },
]
const orderStatusTotal = orderStatusPieData.reduce(
  (sum, item) => sum + item.value,
  0
)
const orderStatusPieOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>数量: {c}<br/>占比: {d}%',
  },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: '订单状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        position: 'outside',
        formatter: (params) =>
          `${params.name}: ${params.value} (${params.percent}%)`,
      },
      labelLine: { show: true },
      data: orderStatusPieData,
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      // 在饼图中心显示总数
      center: ['50%', '55%'],
    },
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '55%',
      style: {
        text: `总数\n${orderStatusTotal}`,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#333',
      },
    },
  ],
})

const userDays = ref(7)

function fetchUserAddTrend() {
  getUserAddTrend({ days: userDays.value }).then((res) => {
    const data = res.data || []
    userAddOption.value.xAxis.data = data.map((item) => item.date)
    userAddOption.value.series[0].data = data.map((item) => item.count)
  })
}

// 页面加载时初始化
fetchUserAddTrend()

const gameDays = ref(7)
function fetchGameOrderDistribution() {
  getGameOrderDistribution({ days: gameDays.value }).then((res) => {
    const data = res.data || []
    gameOrderOption.value.xAxis.data = data.map((item) => item.gameName)
    gameOrderOption.value.series[0].data = data.map((item) => item.orderCount)
    // 只保留订单数，如果有订单金额可加第二个series
  })
}
fetchGameOrderDistribution()

const incomeDays = ref(7)
function fetchIncomeTrend() {
  getIncomeTrend({ days: incomeDays.value }).then((res) => {
    const data = res.data || []
    incomeOption.value.xAxis.data = data.map((item) => item.date)
    incomeOption.value.series[0].data = data.map((item) => item.income)
  })
}
fetchIncomeTrend()

const orderPieDays = ref(7)
const statusMap = {
  1: '未接手',
  2: '代练中',
  3: '待验收',
  5: '已完成',
  6: '已撤销',
  7: '撤销中',
  8: '待介入',
  9: '介入中',
  10: '已仲裁',
}

function fetchOrderStatusPie() {
  getOrderStatusPie({ days: orderPieDays.value }).then((res) => {
    const data = res.data || []
    const pieData = data.map((item) => ({
      value: item.count,
      name: statusMap[item.status] || item.status,
    }))
    orderStatusPieOption.value.series[0].data = pieData
    // 更新总数
    const total = pieData.reduce((sum, item) => sum + item.value, 0)
    orderStatusPieOption.value.graphic[0].style.text = `总数\\n${total}`
  })
}
fetchOrderStatusPie()

const userTotal = ref(0)
const userTodayNew = ref(0)

function fetchUserStats() {
  getUserStats().then((res) => {
    userTotal.value = res.data?.total ?? 0
    userTodayNew.value = res.data?.todayNew ?? 0
  })
}
fetchUserStats()
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}
.stat-card {
  text-align: center;
  margin-bottom: 8px;
  min-width: 140px;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}
.stat-title {
  font-size: 16px;
  color: #888;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 8px;
}
</style>
