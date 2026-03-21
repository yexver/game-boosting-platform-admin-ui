<template>
  <div>
    <el-card>
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="用户ID" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 账户表格 -->
      <el-table :data="accountList" style="width: 100%">
        <el-table-column
          prop="userId"
          label="用户ID"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="username" label="用户名" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" show-overflow-tooltip />
        <el-table-column prop="balance" label="余额" show-overflow-tooltip />
        <el-table-column
          prop="frozenAmount"
          label="冻结金额"
          show-overflow-tooltip
        />
        <el-table-column
          prop="totalIncome"
          label="总收入"
          show-overflow-tooltip
        />
        <el-table-column
          prop="totalExpense"
          label="总支出"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          :formatter="formatTime"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="openAdjust(row)"
              >余额调整</el-button
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

    <!-- 账户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="账户详情" width="500px">
      <div v-if="currentAccount">
        <p>用户ID：{{ currentAccount.userId }}</p>
        <p>余额：{{ currentAccount.balance }}</p>
        <p>冻结金额：{{ currentAccount.frozenAmount }}</p>
        <p>总收入：{{ currentAccount.totalIncome }}</p>
        <p>总支出：{{ currentAccount.totalExpense }}</p>
        <p>创建时间：{{ formatTimeValue(currentAccount.createdAt) }}</p>
        <p>更新时间：{{ formatTimeValue(currentAccount.updatedAt) }}</p>
      </div>
    </el-dialog>

    <!-- 余额调整弹窗 -->
    <el-dialog v-model="adjustVisible" title="余额调整" width="400px">
      <el-form :model="adjustForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="adjustForm.type">
            <el-option label="充值" :value="1" />
            <el-option label="解冻" :value="6" />
            <el-option label="冻结" :value="7" />
            <el-option label="扣款" :value="9" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="adjustForm.amount" :min="0.01" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="adjustForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdjust">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getAccountList,
  getAccountDetail,
  adjustAccountBalance,
} from '@/api/account/index'
import { ElMessage } from 'element-plus'

const searchForm = reactive({ userId: '', phone: '' })
const accountList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailVisible = ref(false)
const currentAccount = ref(null)

const adjustVisible = ref(false)
const adjustForm = reactive({
  userId: '',
  type: 1,
  amount: 0,
  remark: '',
})

function fetchList() {
  getAccountList({
    userId: searchForm.userId,
    phone: searchForm.phone,
    current: currentPage.value,
    size: pageSize.value,
  }).then((res) => {
    accountList.value = res.data.records
    total.value = Number(res.data.total) // 强制转为数字
    pageSize.value = Number(res.data.size)
    currentPage.value = Number(res.data.current)
  })
}

function resetSearch() {
  searchForm.userId = ''
  searchForm.phone = ''
  fetchList()
}

function openDetail(row) {
  getAccountDetail(row.id).then((res) => {
    currentAccount.value = res.data
    detailVisible.value = true
  })
}

function openAdjust(row) {
  adjustForm.userId = row.userId
  adjustForm.type = 1
  adjustForm.amount = 0
  adjustForm.remark = ''
  adjustVisible.value = true
}

function submitAdjust() {
  adjustAccountBalance({
    userId: adjustForm.userId,
    type: adjustForm.type,
    amount: adjustForm.amount,
    remark: adjustForm.remark,
  }).then(() => {
    ElMessage.success('操作成功')
    adjustVisible.value = false
    fetchList()
  })
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

function formatTimeValue(val) {
  if (!val) return ''
  const date = new Date(val)
  return date.toLocaleString()
}

onMounted(fetchList)
</script>
