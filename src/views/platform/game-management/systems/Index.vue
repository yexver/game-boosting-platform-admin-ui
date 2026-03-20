<template>
  <div class="system-list-container">
    <el-card>
      <el-form
        :model="searchForm"
        label-width="90px"
        class="system-search-form"
        inline
      >
        <el-form-item label="系统名称">
          <el-input v-model="searchForm.name" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="table-tools" style="margin-bottom: 12px">
        <el-button type="primary" @click="openAddDialog">新增系统</el-button>
      </div>
      <el-table
        :data="systemList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
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
              width="32"
              height="32"
              alt="icon"
            />
            <span v-else class="no-icon">无图标</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="系统名称" />
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
        <el-form-item label="系统名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="系统图标" prop="icon">
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
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getSystemList,
  createSystem,
  updateSystem,
  deleteSystem,
} from '@/api/platform/game-management/systems'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import settings from '@/settings'

const searchForm = reactive({
  name: '',
})
const systemList = ref([])
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
  sortOrder: 0,
})
const rules = {
  name: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
}
const formRef = ref()
const imageUrl = ref('') // 用于预览的图片URL
const imageFile = ref(null) // 存储选择的图片文件

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
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 图片选择变化处理
function handleAvatarChange(file) {
  if (file && file.raw) {
    imageFile.value = file.raw
    imageUrl.value = URL.createObjectURL(file.raw)
  }
}

function toCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCamel)
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v),
      ])
    )
  }
  return obj
}

function formatTime(row, column, cellValue) {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  return date.toLocaleString()
}

function fetchList() {
  getSystemList({
    name: searchForm.name,
    page: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    // 重点：records 是数组
    systemList.value = toCamel(res.data?.records || [])
    total.value = Number(res.data?.total) || 0
  })
}
function handleSearch() {
  currentPage.value = 1
  fetchList()
}
function resetSearch() {
  searchForm.name = ''
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
  dialogTitle.value = '新增系统'
  Object.assign(form, {
    id: undefined,
    name: '',
    icon: '',
    sortOrder: 0,
  })
  imageUrl.value = ''
  imageFile.value = null
  dialogVisible.value = true
}
function openEditDialog(row) {
  dialogTitle.value = '编辑系统'
  Object.assign(form, { ...row, code: undefined })
  // 设置图片预览
  if (row.icon) {
    imageUrl.value = getIconUrl(row.icon)
  } else {
    imageUrl.value = ''
  }
  imageFile.value = null
  dialogVisible.value = true
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return

    // 封装 systemData
    const systemData = {
      name: form.name,
      sortOrder: form.sortOrder,
      // 其它字段
    }
    const formData = new FormData()
    const blob = new Blob([JSON.stringify(systemData)], {
      type: 'application/json',
    })
    formData.append('systemData', blob)
    if (imageFile.value) {
      formData.append('icon', imageFile.value)
    } else if (form.icon) {
      formData.append('icon', form.icon)
    }

    if (form.id) {
      updateSystem(form.id, formData).then(() => {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchList()
      })
    } else {
      createSystem(formData).then(() => {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchList()
      })
    }
  })
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该游戏系统吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deleteSystem(row.id).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}
onMounted(fetchList)
</script>

<style scoped>
.system-list-container {
  padding: 20px;
}
.table-tools {
  margin-bottom: 12px;
}
.no-icon {
  color: #999;
  font-size: 12px;
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
</style>
