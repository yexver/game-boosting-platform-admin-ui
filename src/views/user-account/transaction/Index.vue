<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 16px">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="用户ID" />
        </el-form-item>
        <el-form-item label="操作者ID">
          <el-input v-model="searchForm.operatorId" placeholder="操作者ID" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            clearable
            placeholder="全部类型"
            style="width: 120px"
          >
            <el-option label="充值" :value="1" />
            <el-option label="订单收入" :value="2" />
            <el-option label="退款" :value="3" />
            <el-option label="提现" :value="10" />
            <el-option label="订单支出" :value="11" />
            <el-option label="罚款" :value="12" />
            <el-option label="冻结资金" :value="20" />
            <el-option label="解冻资金" :value="30" />
            <el-option label="解冻并扣除" :value="31" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="transactionList" style="width: 100%">
        <el-table-column
          prop="transactionNo"
          label="流水号"
          show-overflow-tooltip
        />
        <el-table-column
          prop="operatorId"
          label="操作者ID"
          show-overflow-tooltip
        />
        <el-table-column
          prop="type"
          label="类型"
          :formatter="typeFormatter"
          show-overflow-tooltip
        />
        <el-table-column prop="amount" label="金额" show-overflow-tooltip />
        <el-table-column
          prop="balanceBefore"
          label="交易前余额"
          show-overflow-tooltip
        />
        <el-table-column
          prop="balanceAfter"
          label="交易后余额"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          label="状态"
          :formatter="statusFormatter"
          show-overflow-tooltip
        />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column
          prop="createdAt"
          label="时间"
          :formatter="formatTime"
          show-overflow-tooltip
        />
      </el-table>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @update:current-page="handleCurrentChange"
        @update:page-size="handleSizeChange"
        layout="prev, pager, next, sizes, total"
        :page-sizes="[10, 20, 50, 100]"
        style="margin-top: 16px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getTransactionList } from '@/api/account/transaction'

const searchForm = reactive({
  userId: '', // 必填
  type: undefined,
  dateRange: [],
  operatorId: '', // 新增
})
const transactionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

function fetchList() {
  getTransactionList({
    userId: searchForm.userId || undefined,
    operatorId: searchForm.operatorId || undefined,
    type: searchForm.type,
    // value-format 已为 yyyy-MM-dd HH:mm:ss 字符串，直接传给后端，避免 Date 时区偏移
    startTime: searchForm.dateRange?.[0] || undefined,
    endTime: searchForm.dateRange?.[1] || undefined,
    current: currentPage.value,
    size: pageSize.value,
  }).then((res) => {
    transactionList.value = res.data.records
    total.value = Number(res.data.total)
    pageSize.value = Number(res.data.size)
    currentPage.value = Number(res.data.current)
  })
}

function resetSearch() {
  searchForm.type = undefined
  searchForm.dateRange = []
  fetchList()
}

function handleCurrentChange(page) {
  currentPage.value = page
  fetchList()
}
function handleSizeChange(size) {
  pageSize.value = size
  fetchList()
}

function formatTime(row, column, cellValue) {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  return date.toLocaleString()
}

function typeFormatter(row) {
  const map = {
    // 收入类 (1-9)
    1: '充值',
    2: '订单收入',
    3: '退款',
    // 支出类 (10-19)
    10: '提现',
    11: '订单支出',
    12: '罚款',
    // 冻结解冻类
    20: '冻结资金',
    30: '解冻资金',
    31: '解冻并扣除',
  }
  return map[row.type] || row.type
}

function statusFormatter(row) {
  const map = {
    1: '处理中',
    2: '成功',
    3: '失败',
  }
  return map[row.status] || row.status
}
</script>
