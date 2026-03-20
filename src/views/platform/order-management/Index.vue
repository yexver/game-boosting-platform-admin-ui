<template>
  <div>
    <!-- 查询表单 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="订单号">
        <el-input
          v-model="searchForm.orderNo"
          placeholder="请输入订单号"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable>
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchOrders">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 订单表格 -->
    <el-table :data="orderList" border style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="amount" label="金额" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          {{ statusMap[row.status] || row.status }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="viewDetail(row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      background
      layout="prev, pager, next, jumper, ->, total"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getOrderInfoList } from '@/api/order'

// 查询表单
const searchForm = ref({
  orderNo: '',
  status: '',
  dateRange: [],
})

// 状态选项
const statusOptions = [
  { value: '', label: '全部' },
  { value: 1, label: '未接手' },
  { value: 2, label: '代练中' },
  { value: 3, label: '待验收' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已撤销' },
  { value: 7, label: '撤销中' },
  { value: 8, label: '待介入' },
  { value: 9, label: '介入中' },
  { value: 10, label: '已仲裁' },
]

// 状态映射
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

// 订单数据
const orderList = ref([])
// 分页
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 查询订单
function fetchOrders() {
  getOrderInfoList({
    orderNo: searchForm.value.orderNo || undefined,
    status: searchForm.value.status || undefined,
    pageNum: page.value,
    pageSize: pageSize.value,
    // 可根据需要添加时间范围等参数
  }).then((res) => {
    orderList.value = res.data?.list || []
    total.value = Number(res.data?.total) || 0
  })
}

// 重置表单
function resetForm() {
  searchForm.value = {
    orderNo: '',
    status: '',
    dateRange: [],
  }
  fetchOrders()
}

// 分页切换
function handlePageChange(val) {
  page.value = val
  fetchOrders()
}

// 查看详情
function viewDetail(row) {
  // 跳转或弹窗
  alert('订单详情：' + row.orderNo)
}

// 初始化
fetchOrders()
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
