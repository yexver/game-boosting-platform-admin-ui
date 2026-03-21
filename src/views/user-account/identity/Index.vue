<template>
  <div>
    <el-card>
      <template #header>
        <span>实名认证管理</span>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="用户ID" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.status" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 认证列表 -->
      <el-table :data="identityList" style="width: 100%">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="idCardNumber" label="身份证号" width="180">
          <template #default="{ row }">
            {{ maskIdCard(row.idCardNumber) }}
          </template>
        </el-table-column>
        <el-table-column prop="verificationStatus" label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.verificationStatus)">
              {{ getStatusText(row.verificationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="verifiedAt" label="审核时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.verifiedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)"
              >查看详情</el-button
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="实名认证详情" width="600px">
      <div v-if="currentIdentity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{
            currentIdentity.userId
          }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            currentIdentity.realName
          }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{
            currentIdentity.idCardNumber
          }}</el-descriptions-item>
          <el-descriptions-item label="认证状态">
            <el-tag :type="getStatusType(currentIdentity.verificationStatus)">
              {{ getStatusText(currentIdentity.verificationStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{
            formatTime(currentIdentity.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{
            formatTime(currentIdentity.verifiedAt)
          }}</el-descriptions-item>
          <el-descriptions-item
            label="拒绝原因"
            v-if="currentIdentity.rejectReason"
          >
            {{ currentIdentity.rejectReason }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 证件照片 -->
        <div style="margin-top: 20px">
          <h4>证件照片</h4>
          <div style="display: flex; gap: 20px; margin-top: 10px">
            <div>
              <p>身份证正面</p>
              <img :src="currentIdentity.idCardFrontUrl" class="id-image" />
            </div>
            <div>
              <p>身份证反面</p>
              <img :src="currentIdentity.idCardBackUrl" class="id-image" />
            </div>
            <div v-if="currentIdentity.facePhotoUrl">
              <p>手持身份证照片</p>
              <img :src="currentIdentity.facePhotoUrl" class="id-image" />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getIdentityList } from '@/api/user/index'

const searchForm = reactive({
  userId: '',
  realName: '',
  status: '',
})

const identityList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailVisible = ref(false)
const currentIdentity = ref(null)

function fetchList() {
  getIdentityList({
    userId: searchForm.userId,
    realName: searchForm.realName,
    verificationStatus: searchForm.status,
    current: currentPage.value,
    size: pageSize.value,
  })
    .then((res) => {
      console.log('API响应:', res)
      identityList.value = res.data.records || []
      total.value = Number(res.data.total) || 0
      currentPage.value = Number(res.data.current) || 1
      pageSize.value = Number(res.data.size) || 10
    })
    .catch((error) => {
      console.error('获取数据失败:', error)
      ElMessage.error('获取数据失败')
    })
}

function resetSearch() {
  searchForm.userId = ''
  searchForm.realName = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchList()
}

function viewDetail(row) {
  currentIdentity.value = row
  detailVisible.value = true
}

function handleCurrentChange(page) {
  currentPage.value = page
  fetchList()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function getStatusText(status) {
  const map = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝',
  }
  return map[status] || '未知'
}

function getStatusType(status) {
  const map = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return map[status] || 'info'
}

function maskIdCard(idCard) {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

function formatTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(fetchList)
</script>

<style scoped>
.id-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
