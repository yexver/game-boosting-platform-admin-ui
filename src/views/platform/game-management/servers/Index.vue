<template>
  <div class="server-list-container">
    <el-card>
      <el-form
        :model="searchForm"
        label-width="90px"
        class="server-search-form"
        inline
      >
        <el-form-item label="区服名称">
          <el-input v-model="searchForm.name" placeholder="请输入区服名称" />
        </el-form-item>
        <el-form-item label="所属游戏ID">
          <el-input
            v-model="searchForm.gameId"
            placeholder="请输入所属游戏ID"
          />
        </el-form-item>
        <el-form-item label="所属系统ID">
          <el-input
            v-model="searchForm.systemId"
            placeholder="请输入所属系统ID"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="table-tools" style="margin-bottom: 12px">
        <el-button type="primary" @click="openAddDialog">新增区服</el-button>
        <el-button type="primary" @click="openImportDialog">批量导入</el-button>
        <el-button
          type="success"
          @click="downloadTemplate"
          style="margin-left: 8px"
        >
          下载导入模板
        </el-button>
      </div>
      <el-table
        :data="serverList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="gameId" label="所属游戏ID" width="100" />
        <el-table-column prop="systemId" label="所属系统ID" width="100" />
        <el-table-column prop="name" label="区服名称" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)"
              >编辑</el-button
            >
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next, sizes, jumper, total"
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 16px"
      />
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="所属游戏ID" prop="gameId">
          <el-input v-model="form.gameId" />
        </el-form-item>
        <el-form-item label="所属系统ID" prop="systemId">
          <el-input v-model="form.systemId" />
        </el-form-item>
        <el-form-item label="区服名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
    <el-dialog title="批量导入区服" v-model="importDialogVisible" width="400px">
      <el-upload
        :http-request="customImportRequest"
        :show-file-list="false"
        :before-upload="beforeImportUpload"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        accept=".xlsx,.xls,.csv"
      >
        <el-button type="primary">选择文件上传</el-button>
        <div class="upload-tip">
          仅支持 Excel，模板请下载
          <a :href="templateUrl" download>导入模板</a>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getServerList,
  createServer,
  updateServer,
  deleteServer,
  // changeServerStatus, // 删除
  importServers,
} from '@/api/platform/game-management/servers'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

const searchForm = reactive({
  name: '',
  gameId: '',
  systemId: '',
})
const serverList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  id: undefined,
  gameId: '',
  systemId: '',
  name: '',
  sortOrder: 0,
})
const rules = {
  gameId: [{ required: true, message: '请输入所属游戏ID', trigger: 'blur' }],
  systemId: [{ required: true, message: '请输入所属系统ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入区服名称', trigger: 'blur' }],
}
const formRef = ref()

const importDialogVisible = ref(false)
const templateUrl = '/server-import-template.xlsx'
function downloadTemplate() {
  window.open(templateUrl)
}

function customImportRequest({ file, onSuccess, onError }) {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在导入，请稍候...',
  })
  importServers(file)
    .then((res) => {
      onSuccess(res)
    })
    .catch((err) => {
      onError(err)
    })
    .finally(() => {
      loadingInstance.close()
    })
}

function fetchList() {
  getServerList({
    name: searchForm.name,
    gameId: searchForm.gameId,
    systemId: searchForm.systemId,
    page: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    serverList.value = res.data?.records || []
    total.value = Number(res.data?.total) || 0
  })
}
function handleSearch() {
  currentPage.value = 1
  fetchList()
}
function resetSearch() {
  searchForm.name = ''
  searchForm.gameId = ''
  searchForm.systemId = ''
  handleSearch()
}
function handleSizeChange(size) {
  pageSize.value = size
  fetchList()
}
function handleCurrentChange(page) {
  currentPage.value = page
  fetchList()
}
function handleSelectionChange(val) {
  selectedRows.value = val
}
function openAddDialog() {
  dialogTitle.value = '新增区服'
  Object.assign(form, {
    id: undefined,
    gameId: '',
    systemId: '',
    name: '',
    sortOrder: 0,
  })
  dialogVisible.value = true
}
function openEditDialog(row) {
  dialogTitle.value = '编辑区服'
  Object.assign(form, { ...row, code: undefined })
  dialogVisible.value = true
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return
    const submitData = {
      gameId: form.gameId,
      systemId: form.systemId,
      name: form.name,
      sortOrder: form.sortOrder,
      // 其它字段
    }
    if (form.id) {
      updateServer(form.id, submitData).then(() => {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchList()
      })
    } else {
      createServer(submitData).then(() => {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchList()
      })
    }
  })
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该区服吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deleteServer(row.id).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}
// function handleStatusChange(row, val) { // 删除
//   changeServerStatus(row.id, val).then(() => { // 删除
//     ElMessage.success('状态已更新') // 删除
//     fetchList() // 删除
//   }) // 删除
// } // 删除
function openImportDialog() {
  importDialogVisible.value = true
}
function beforeImportUpload(file) {
  const isExcel =
    file.type.includes('excel') ||
    file.type.includes('spreadsheet') ||
    file.name.endsWith('.csv')
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 或 CSV 文件')
  }
  return isExcel
}
function handleImportSuccess() {
  ElMessage.success('导入成功')
  importDialogVisible.value = false
  fetchList()
}
function handleImportError() {
  ElMessage.error('导入失败')
}
onMounted(fetchList)
</script>

<style scoped>
.server-list-container {
  padding: 20px;
}
.table-tools {
  margin-bottom: 12px;
}
</style>
