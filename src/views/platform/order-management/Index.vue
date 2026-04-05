<template>
  <!-- 详情为「订单列表」子路由时，在此渲染子页面（父组件须含 router-view） -->
  <router-view v-if="isOrderDetailChild" />
  <div v-else class="order-management-container">
    <el-card>
      <!-- 查询表单 -->
      <el-form :model="searchForm" label-width="90px" class="order-search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="订单号">
              <el-input
                v-model="searchForm.orderNo"
                placeholder="请输入订单号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="游戏名称">
              <el-select
                v-model="searchForm.gameId"
                placeholder="请选择游戏"
                clearable
                filterable
              >
                <el-option
                  v-for="item in gameOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
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
          </el-col>
          <el-col :span="8">
            <el-form-item label="金额范围">
              <el-input
                v-model="searchForm.minAmount"
                placeholder="最低金额"
                style="width: 100px"
                clearable
              />
              <span style="padding: 0 8px">-</span>
              <el-input
                v-model="searchForm.maxAmount"
                placeholder="最高金额"
                style="width: 100px"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" style="display: flex; align-items: center">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </el-form>

      <!-- 表格操作工具栏 -->
      <div class="table-tools">
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon> 导出
        </el-button>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedRows.length"
        >
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>

      <!-- 订单表格 -->
      <el-table :data="orderList" border @selection-change="handleSelectionChange">
        <!-- 复选框列 -->
        <el-table-column type="selection" width="55" />

        <el-table-column
          prop="orderNo"
          label="订单号"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="title"
          label="订单标题"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="gameName"
          label="游戏"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="publisherUsername"
          label="发单用户"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="price" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 500">
              ￥{{ row.price || row.amount || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ statusMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="下单时间"
          width="160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="goToDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 8"
              size="small"
              type="warning"
              @click="handleIntervene(row)"
            >
              介入
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="slot, prev, pager, next, sizes, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <template #default>
          <span class="el-pagination__total">
            共 {{ total }} 条记录
          </span>
        </template>
      </el-pagination>
    </el-card>

    <!-- 确认删除对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
      <span>确定要删除选中的 {{ selectedRows.length }} 个订单吗？此操作不可恢复！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="confirmBatchDelete">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrderInfoList,
  exportOrders,
  batchDeleteOrders,
  interveneOrder,
} from '@/api/order'
import { getGameList } from '@/api/platform/game-management/games'

const router = useRouter()
const route = useRoute()

/** 与菜单「订单管理 → 订单列表 → order-detail/:id」嵌套路径一致 */
const isOrderDetailChild = computed(() =>
  /\/order\/order-detail\//.test(route.path)
)

// 查询表单
const searchForm = ref({
  orderNo: '',
  status: '',
  gameId: '',
  dateRange: [],
  minAmount: '',
  maxAmount: '',
})

// 游戏选项
const gameOptions = ref([])

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
  4: '验收中',
  5: '已完成',
  6: '已撤销',
  7: '撤销中',
  8: '待介入',
  9: '介入中',
  10: '已仲裁',
  12: '已仲裁',
}

// 状态tag类型
const statusTypeMap = {
  1: 'info',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'success',
  6: 'info',
  7: 'warning',
  8: 'danger',
  9: 'danger',
  10: 'info',
  12: 'info',
}

function getStatusType(status) {
  return statusTypeMap[status] || 'info'
}

// 订单数据
const orderList = ref([])
// 分页
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
// 选中行
const selectedRows = ref([])
// 删除对话框
const deleteDialogVisible = ref(false)

// 加载游戏列表
function fetchGameList() {
  getGameList({ pageNum: 1, pageSize: 100 })
    .then((res) => {
      if (res.code === 200) {
        gameOptions.value = res.data?.list || res.data || []
      }
    })
    .catch(() => {
      console.error('获取游戏列表失败')
    })
}

// 查询订单
function fetchOrders() {
  const params = {
    orderNo: searchForm.value.orderNo || undefined,
    status: searchForm.value.status || undefined,
    gameId: searchForm.value.gameId || undefined,
    page: currentPage.value,
    pageSize: pageSize.value,
    // 修复：传递时间范围参数
    beginCreateTime:
      searchForm.value.dateRange && searchForm.value.dateRange.length > 0
        ? searchForm.value.dateRange[0]
        : undefined,
    endCreateTime:
      searchForm.value.dateRange && searchForm.value.dateRange.length > 0
        ? searchForm.value.dateRange[1]
        : undefined,
    minAmount: searchForm.value.minAmount || undefined,
    maxAmount: searchForm.value.maxAmount || undefined,
  }

  getOrderInfoList(params)
    .then((res) => {
      if (res.code === 200) {
        orderList.value = res.data?.list || res.data?.records || []
        total.value = Number(res.data?.total) || 0
      }
    })
    .catch((error) => {
      console.error('获取订单列表失败:', error)
      orderList.value = []
      total.value = 0
    })
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchOrders()
}

// 重置搜索
function resetSearch() {
  searchForm.value = {
    orderNo: '',
    status: '',
    gameId: '',
    dateRange: [],
    minAmount: '',
    maxAmount: '',
  }
  currentPage.value = 1
  fetchOrders()
}

// 分页切换
function handleCurrentChange(page) {
  currentPage.value = page
  fetchOrders()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

// 多选变更
function handleSelectionChange(rows) {
  selectedRows.value = rows
}

// 跳转详情页
function goToDetail(row) {
  const id = row.id || row.orderNo
  router.push(`/order-management/order/order-detail/${id}`)
}

// 导出
function handleExport() {
  const params = {
    orderNo: searchForm.value.orderNo || undefined,
    status: searchForm.value.status || undefined,
    gameId: searchForm.value.gameId || undefined,
    beginCreateTime:
      searchForm.value.dateRange && searchForm.value.dateRange.length > 0
        ? searchForm.value.dateRange[0]
        : undefined,
    endCreateTime:
      searchForm.value.dateRange && searchForm.value.dateRange.length > 0
        ? searchForm.value.dateRange[1]
        : undefined,
    minAmount: searchForm.value.minAmount || undefined,
    maxAmount: searchForm.value.maxAmount || undefined,
  }

  exportOrders(params)
    .then((res) => {
      if (!(res instanceof Blob) || res.size === 0) {
        ElMessage.error('导出接口暂未实现或返回数据为空')
        return
      }
      if (res.type.includes('text/html') || res.type.includes('application/json')) {
        ElMessage.error('导出失败：服务器返回错误信息')
        return
      }
      const url = window.URL.createObjectURL(res)
      const link = document.createElement('a')
      link.href = url
      link.download = `订单列表_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    })
    .catch((error) => {
      console.error('导出失败:', error)
      ElMessage.error('导出接口调用失败')
    })
}

// 批量删除
function handleBatchDelete() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  deleteDialogVisible.value = true
}

function confirmBatchDelete() {
  const ids = selectedRows.value.map((row) => row.id)
  batchDeleteOrders(ids)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        deleteDialogVisible.value = false
        fetchOrders()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    })
    .catch(() => {
      ElMessage.error('删除失败')
    })
}

// 介入订单
function handleIntervene(row) {
  ElMessageBox.confirm(`确定要介入订单 ${row.orderNo} 吗？`, '确认介入', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      interveneOrder(row.id)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success('介入成功')
            fetchOrders()
          } else {
            ElMessage.error(res.msg || '介入失败')
          }
        })
        .catch(() => {
          ElMessage.error('介入失败')
        })
    })
    .catch(() => {})
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

// 初始化
onMounted(() => {
  fetchOrders()
  fetchGameList()
})
</script>

<style scoped>
.order-management-container {
  padding: 10px;
}

.order-search-form {
  margin-bottom: 20px;
}

.table-tools {
  margin: 15px 0;
}

.table-tools .el-button {
  margin-right: 10px;
}

.el-pagination {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
