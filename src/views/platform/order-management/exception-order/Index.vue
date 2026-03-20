<template>
  <div class="exception-order-list-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 16px">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="订单号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 异常订单表格 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column
          prop="orderNo"
          label="订单号"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column
          prop="publisherId"
          label="发布者ID"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="takerId"
          label="接手者ID"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="price"
          label="金额"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="100">
          <template #default>
            <el-tag type="warning">待介入</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="160"
          :formatter="formatTimeCell"
        />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleIntervene(row)"
              >介入订单</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { ref, reactive, onMounted } from 'vue'
import { getOrderInfoList } from '@/api/order/index'
import { ElMessage } from 'element-plus'
import { interveneOrder } from '@/api/order/index'

const searchForm = reactive({ orderNo: '' })
const orderList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

function formatTimeCell(rowOrValue) {
  let value = rowOrValue
  // 兼容 el-table-column 的 formatter 传参
  if (
    typeof rowOrValue === 'object' &&
    rowOrValue !== null &&
    'updatedAt' in rowOrValue
  ) {
    value = rowOrValue.updatedAt
  }
  if (!value) return ''
  let date
  if (typeof value === 'number') {
    date = value > 1e12 ? new Date(value) : new Date(value * 1000)
  } else if (typeof value === 'string' && /^\d+$/.test(value)) {
    const num = Number(value)
    date = num > 1e12 ? new Date(num) : new Date(num * 1000)
  } else {
    date = new Date(value)
  }
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

function fetchList() {
  getOrderInfoList({
    orderNo: searchForm.orderNo || undefined,
    status: 8,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    orderList.value = res.data?.list || []
    total.value = Number(res.data?.total) || 0
  })
}

function resetSearch() {
  searchForm.orderNo = ''
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
async function handleIntervene(row) {
  try {
    await interveneOrder(row.id)
    ElMessage.success('介入成功')
    fetchList()
  } catch (e) {
    ElMessage.error(e?.msg || e?.message || '介入失败')
  }
}
onMounted(fetchList)
</script>

<style scoped>
.exception-order-list-container {
  padding: 20px;
}
</style>
