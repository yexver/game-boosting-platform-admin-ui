<template>
  <div class="game-list-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form
        :model="searchForm"
        label-width="90px"
        class="game-search-form"
        inline
      >
        <el-form-item label="游戏名称">
          <el-input v-model="searchForm.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="table-tools" style="margin-bottom: 12px">
        <el-button type="primary" @click="openAddDialog">新增游戏</el-button>
      </div>

      <!-- 游戏表格 -->
      <el-table
        :data="gameList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="游戏名称" />
        <el-table-column prop="icon" label="图标">
          <template #default="{ row }">
            <img
              v-if="row.icon"
              :src="
                row.icon.startsWith('http')
                  ? row.icon
                  : settings.imgBaseUrl + row.icon
              "
              class="square-avatar"
              width="40"
              height="40"
              alt="icon"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="160"
          :formatter="formatTime"
        />
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="160"
          :formatter="formatTime"
        />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)"
              >编辑</el-button
            >
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <div v-if="loading" class="dialog-loading-overlay">
        <div class="dialog-loading-spinner">
          <el-icon><Loading /></el-icon>
          <span>保存中...</span>
        </div>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
            action="#"
            :auto-upload="false"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议上传正方形图片，大小不超过2MB</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="绑定系统" prop="systemIds">
          <el-select v-model="form.systemIds" multiple placeholder="请选择系统">
            <el-option
              v-for="sys in allSystems"
              :key="sys.id"
              :label="sys.name"
              :value="sys.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getGameList,
  createGame,
  updateGame,
  deleteGame,
  changeGameStatus,
  getGameDetail,
} from '@/api/platform/game-management/games'
import { getSystemList } from '@/api/platform/game-management/systems'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import settings from '@/settings'
import { ElLoading } from 'element-plus'

const searchForm = reactive({
  name: '',
  status: undefined,
})
const gameList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  id: undefined,
  name: '',
  icon: '',
  status: 1,
  sortOrder: 0,
  systemIds: [], // 新增
})
const rules = {
  name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
}
const formRef = ref()
const imageUrl = ref('') // 用于预览的图片URL
const imageFile = ref(null) // 存储选择的图片文件
const allSystems = ref([])
const loading = ref(false)

// 获取图标URL
function getIconUrl(icon) {
  if (!icon) return ''
  const iconPath = icon.split(' ')[0] // 只取第一个路径
  return iconPath.startsWith('http') ? iconPath : settings.imgBaseUrl + iconPath
}

// 上传前验证
function beforeAvatarUpload(file) {
  const isJPG =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/gif'
  const isLt500K = file.size / 1024 / 1024 < 0.5 // 改为500KB

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
  }
  if (!isLt500K) {
    ElMessage.error('上传图片大小不能超过 500KB!')
  }
  return isJPG && isLt500K
}

// 图片选择变化处理
function handleAvatarChange(file) {
  if (file && file.raw) {
    imageFile.value = file.raw
    imageUrl.value = URL.createObjectURL(file.raw)
  }
}

function formatTime(row, column, cellValue) {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  return date.toLocaleString()
}

function fetchList() {
  getGameList({
    name: searchForm.name,
    status: searchForm.status === undefined ? '' : searchForm.status,
    pageNum: currentPage.value, // 改为 pageNum
    pageSize: pageSize.value,
  }).then((res) => {
    console.log('res', res)
    gameList.value = res.data?.records || []
    total.value = Number(res.data?.total) || 0
  })
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}
function resetSearch() {
  searchForm.name = ''
  searchForm.status = undefined
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
  dialogTitle.value = '新增游戏'
  Object.assign(form, {
    id: undefined,
    name: '',
    icon: '',
    status: 1,
    sortOrder: 0,
    systemIds: [], // 新增
  })
  imageUrl.value = ''
  imageFile.value = null
  dialogVisible.value = true
}
async function openEditDialog(row) {
  dialogTitle.value = '编辑游戏'
  // 获取详情
  const res = await getGameDetail(row.id)
  const detail = res.data || {}
  Object.assign(form, {
    id: detail.id,
    name: detail.name,
    icon: detail.icon,
    status: Number(detail.status),
    sortOrder: detail.sortOrder,
    // 其它字段
    systemIds: detail.systemIds || [], // 假设后端返回 systemIds: [1,2]
  })
  // 设置图片预览
  if (detail.icon) {
    imageUrl.value = getIconUrl(detail.icon)
  } else {
    imageUrl.value = ''
  }
  imageFile.value = null
  dialogVisible.value = true
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return

    const loadingInstance = ElLoading.service({ lock: true, text: '保存中...' })
    const gameData = {
      name: form.name,
      status: form.status,
      sortOrder: form.sortOrder,
      systemIds: form.systemIds,
      // 其它字段
    }
    const formData = new FormData()
    const blob = new Blob([JSON.stringify(gameData)], {
      type: 'application/json',
    })
    formData.append('gameData', blob)
    if (imageFile.value) {
      formData.append('icon', imageFile.value)
    }

    const req = form.id ? updateGame(form.id, formData) : createGame(formData)

    req
      .then(() => {
        ElMessage.success(form.id ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchList()
      })
      .catch(() => {
        // 可选：ElMessage.error('保存失败')
      })
      .finally(() => {
        loadingInstance.close()
      })
  })
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该游戏吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deleteGame(row.id).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}
function handleStatusChange(row, val) {
  changeGameStatus(row.id, val).then(() => {
    ElMessage.success('状态已更新')
    fetchList()
  })
}
function fetchAllSystems() {
  getSystemList({ page: 1, pageSize: 1000 }) // 或后端支持 all=true
    .then((res) => {
      allSystems.value = res.data?.records || []
    })
}
onMounted(() => {
  fetchList()
  fetchAllSystems()
})
</script>

<style scoped>
.game-list-container {
  padding: 20px;
}
.table-tools {
  margin-bottom: 12px;
}
.avatar-uploader .avatar {
  width: 64px;
  height: 64px;
  display: block;
  object-fit: cover;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 64px;
  height: 64px;
  text-align: center;
  line-height: 64px;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
.square-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px; /* 轻微圆角，想完全方就设为0 */
  border: 1px solid #eee;
  background: #f5f5f5;
}
.dialog-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.dialog-loading-spinner {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #409eff;
}
.dialog-loading-spinner .el-icon {
  margin-right: 8px;
  font-size: 24px;
}
</style>
