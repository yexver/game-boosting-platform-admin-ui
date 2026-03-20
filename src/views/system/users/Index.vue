<template>
  <div class="user-list-container">
    <el-card>
      <!-- <template #header> </template> -->

      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="90px" class="user-search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="用户ID">
              <el-input
                v-model="searchForm.userId"
                placeholder="请输入用户ID"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户名">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入用户名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="手机号">
              <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
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
        <!-- 在 template 中使用 -->
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button type="success" :icon="Upload" @click="handleImport"
          >导入</el-button
        >
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
      <!-- 用户表格 -->
      <el-table :data="users" border @selection-change="handleSelectionChange">
        <!-- 复选框列 -->
        <el-table-column type="selection" width="55" />

        <el-table-column
          prop="userId"
          label="用户ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="username" label="用户名" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" show-overflow-tooltip />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ $index, row }">
            <el-button size="small" @click="handleEdit($index, row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete($index, row)"
              >删除</el-button
            >
            <el-dropdown
              @command="(command) => handleMoreCommand(command, $index, row)"
            >
              <el-button size="small">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword"
                    >重置密码</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        v-model.sync:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 25, 50, 100]"
        layout="slot, prev, pager, next, sizes, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <template #default>
          <span class="el-pagination__total is-first"
            >共 {{ total }} 条记录 当前显示第 {{ currentPage }} 条记录</span
          >
        </template>
      </el-pagination>
    </el-card>
  </div>

  <el-dialog v-model="addUserDialogVisible" title="新增用户" width="50%">
    <el-form :model="addUserForm" label-width="90px" ref="addUserFormRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="addUserForm.username" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="addUserForm.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱">
            <el-input v-model="addUserForm.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称">
            <el-input v-model="addUserForm.nickname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="addUserForm.gender">
              <el-radio :value="1">男</el-radio>
              <el-radio :value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色">
            <el-select
              v-model="addUserForm.roles"
              multiple
              placeholder="请选择角色"
            >
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="addUserForm.status" placeholder="请选择状态">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码">
            <el-input
              v-model="addUserForm.password"
              type="password"
              show-password
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码">
            <el-input
              v-model="addUserForm.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancelAdd">取 消</el-button>
        <el-button type="primary" @click="submitAddUser">确 定</el-button>
      </div>
    </template>
  </el-dialog>

  <el-drawer
    v-model="editUserDialogVisible"
    title="编辑用户"
    direction="rtl"
    size="50%"
    :with-header="true"
  >
    <el-form :model="editUserForm" label-width="90px" ref="editUserFormRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="editUserForm.username" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="editUserForm.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱">
            <el-input v-model="editUserForm.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称">
            <el-input v-model="editUserForm.nickname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="editUserForm.gender">
              <el-radio :value="1">男</el-radio>
              <el-radio :value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色">
            <el-select
              v-model="editUserForm.roles"
              multiple
              placeholder="请选择角色"
            >
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="editUserForm.status" placeholder="请选择状态">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancelEdit">取 消</el-button>
        <el-button type="primary" @click="submitEditUser">确 定</el-button>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
    <span>确定要删除该用户吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDeleteUser">确 定</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="resetPwdDialogVisible" title="重置密码" width="30%">
    <el-form :model="resetPwdForm" label-width="90px">
      <el-form-item label="新密码">
        <el-input
          v-model="resetPwdForm.newPassword"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="resetPwdForm.confirmPassword"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetPwdDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitResetPassword">确 定</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 添加导入对话框 -->
  <el-dialog title="批量导入用户" v-model="importDialogVisible" width="400px">
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
        仅支持 Excel 文件，模板请下载
        <a href="/user-import-template.xlsx" download>导入模板</a>
      </div>
    </el-upload>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Upload, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  getUserInfoList,
  createUser,
  updateUser,
  deleteUserByIds,
  resetUserPassword,
  exportUsers,
  importUsers, // 确保导入了这个函数
} from '@/api/system/user'
import { getAllRoleIdNameList } from '@/api/system/role'
import { getUserInfoById } from '@/api/system/user'

// 用户列表数据
const users = ref([])
// 角色列表数据
const roles = ref([]) // 存储角色列表
const selectedRoleIds = ref([]) // 当前选中的多个角色 ID

// 当前分页条件
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 搜索表单数据
const searchForm = ref({
  userId: '',
  username: '',
  phone: '',
  status: '',
  createTimeRange: [], // 必须是数组
})

// 搜索操作
const handleSearch = () => {
  fetchUserList()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    userId: '',
    username: '',
    phone: '',
    status: '',
    createTimeRange: [],
  }
  fetchUserList()
}

const addUserForm = ref({
  username: '',
  phone: '',
  email: '',
  nickname: '',
  gender: 1,
  status: 1, // 改为1，默认启用
  password: '',
  confirmPassword: '',
  roles: [],
})
const addUserDialogVisible = ref(false)

// 新增用户
const handleAdd = () => {
  addUserDialogVisible.value = true
}
// 提交新增用户表单
const submitAddUser = () => {
  if (!addUserForm.value.password || !addUserForm.value.confirmPassword) {
    alert('请输入密码和确认密码')
    return
  }
  if (addUserForm.value.password !== addUserForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  // 只取后端需要的字段
  const { username, phone, email, nickname, gender, status, password, roles } =
    addUserForm.value
  createUser({
    username,
    phone,
    email,
    nickname,
    gender,
    status,
    password,
    roles,
  }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('新增用户成功')
      addUserDialogVisible.value = false
      fetchUserList()
    }
  })
}
const resetAddUserForm = () => {
  addUserForm.value = {
    username: '',
    phone: '',
    email: '',
    nickname: '',
    gender: 1,
    status: 0,
    password: '',
    confirmPassword: '',
  }
  selectedRoleIds.value = []
}

// 在取消按钮点击时调用
const handleCancelAdd = () => {
  addUserDialogVisible.value = false
  resetAddUserForm()
}

const editUserDialogVisible = ref(false)
const editUserForm = ref({})
const editUserFormRef = ref(null)
const currentEditUserId = ref(null)
const deleteDialogVisible = ref(false)
const userToDelete = ref(null)
const resetPwdDialogVisible = ref(false)
const resetPwdForm = ref({ newPassword: '', confirmPassword: '' })
const resetPwdUserId = ref(null)
const importDialogVisible = ref(false)

// 编辑用户
const handleEdit = async (index, row) => {
  try {
    const res = await getUserInfoById(row.userId)
    if (res.code === 200) {
      // 兼容角色字段
      editUserForm.value = {
        ...res.data,
        roles: Array.isArray(res.data.role)
          ? res.data.role.map((r) => Number(typeof r === 'object' ? r.id : r))
          : [],
      }
      currentEditUserId.value = res.data.userId
      editUserDialogVisible.value = true
    } else {
      ElMessage.error('获取用户信息失败')
    }
  } catch {
    ElMessage.error('获取用户信息失败')
  }
}
const handleCancelEdit = () => {
  editUserDialogVisible.value = false
  editUserForm.value = {}
}
const submitEditUser = () => {
  const { userId, username, phone, email, nickname, gender, status, roles } =
    editUserForm.value
  updateUser({
    userId: String(userId),
    username,
    phone,
    email,
    nickname,
    gender,
    status,
    roles,
  }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('编辑用户成功')
      editUserDialogVisible.value = false
      fetchUserList()
    }
  })
}

// 删除用户
const handleDelete = (index, row) => {
  userToDelete.value = row
  deleteDialogVisible.value = true
}
const confirmDeleteUser = () => {
  const ids = Array.isArray(userToDelete.value.userId)
    ? userToDelete.value.userId
    : [userToDelete.value.userId]
  deleteUserByIds(ids).then((res) => {
    if (res.code === 200) {
      ElMessage.success('删除用户成功')
      deleteDialogVisible.value = false
      fetchUserList()
    }
  })
}

// 批量删除用户
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的项')
    return
  }
  ElMessageBox.confirm('确定要批量删除选中项吗？', '提示', {
    type: 'warning',
  }).then(() => {
    const ids = selectedRows.value.map((row) => row.userId)
    deleteUserByIds(ids).then((res) => {
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        fetchUserList()
      } else {
        ElMessage.error('批量删除失败')
      }
    })
  })
}
// 导入用户 - 移除调试信息
const handleImport = () => {
  importDialogVisible.value = true
}

// 导出用户
const handleExport = () => {
  const params = {
    ...(searchForm.value.userId && { userId: searchForm.value.userId }),
    ...(searchForm.value.username && { username: searchForm.value.username }),
    ...(searchForm.value.phone && { phone: searchForm.value.phone }),
    ...(searchForm.value.status !== '' && { status: searchForm.value.status }),
    ...(searchForm.value.createTimeRange.length > 0 && {
      beginCreateTime: searchForm.value.createTimeRange[0],
      endCreateTime: searchForm.value.createTimeRange[1],
    }),
  }

  exportUsers(params)
    .then((res) => {
      // 检查响应是否为有效的blob
      if (!(res instanceof Blob) || res.size === 0) {
        ElMessage.error('导出接口暂未实现或返回数据为空')
        return
      }

      // 检查blob类型，避免下载错误页面
      if (
        res.type.includes('text/html') ||
        res.type.includes('application/json')
      ) {
        ElMessage.error('导出失败：服务器返回错误信息')
        return
      }

      // 创建下载链接
      const url = window.URL.createObjectURL(res)
      const link = document.createElement('a')
      link.href = url
      link.download = `用户列表_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    })
    .catch((error) => {
      console.error('导出失败:', error)
      ElMessage.error('导出接口调用失败，请联系管理员')
    })
}
// 存储当前选中的行
const selectedRows = ref([])

// 多选变更时触发
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}
// 获取用户信息列表
const fetchUserList = () => {
  const params = {
    current: currentPage.value,
    size: pageSize.value,
    ...(searchForm.value.userId && { userId: searchForm.value.userId }),
    ...(searchForm.value.username && { username: searchForm.value.username }),
    ...(searchForm.value.phone && { phone: searchForm.value.phone }),
    ...(searchForm.value.status !== '' && { status: searchForm.value.status }),
    ...(searchForm.value.createTimeRange.length > 0 && {
      beginCreateTime: searchForm.value.createTimeRange[0],
      endCreateTime: searchForm.value.createTimeRange[1],
    }),
  }

  getUserInfoList(params)
    .then((res) => {
      if (res.code === 200) {
        users.value = res.data.records
        // 这里将 total、current、size 转为数字
        total.value = Number(res.data.total)
        currentPage.value = Number(res.data.current)
        pageSize.value = Number(res.data.size)
      }
    })
    .catch((error) => {
      console.error('获取用户信息失败:', error)
      users.value = []
      total.value = 0
    })
}

onMounted(() => {
  fetchUserList()
  getAllRoleIdNameList()
    .then((res) => {
      console.log('获取角色列表:', res)
      roles.value = res.data
    })
    .catch((error) => {
      console.error('获取角色列表失败:', error)
    })
})

// 格式化时间戳为日期字符串
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

const handleMoreCommand = (command, index, row) => {
  switch (command) {
    case 'resetPassword':
      resetPwdUserId.value = row.userId
      resetPwdForm.value = { newPassword: '', confirmPassword: '' }
      resetPwdDialogVisible.value = true
      break
    default:
      break
  }
}
const submitResetPassword = () => {
  if (!resetPwdForm.value.newPassword || !resetPwdForm.value.confirmPassword) {
    alert('请输入新密码和确认密码')
    return
  }
  if (resetPwdForm.value.newPassword !== resetPwdForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  resetUserPassword(resetPwdUserId.value, resetPwdForm.value.newPassword).then(
    (res) => {
      if (res.code === 200) {
        ElMessage.success('重置密码成功')
        resetPwdDialogVisible.value = false
      }
    }
  )
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchUserList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchUserList()
}

// 自定义上传请求
const customImportRequest = ({ file, onSuccess, onError }) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在导入，请稍候...',
  })

  importUsers(file)
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

// 上传前验证
const beforeImportUpload = (file) => {
  const isExcel =
    file.type.includes('excel') ||
    file.type.includes('spreadsheet') ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls') ||
    file.name.endsWith('.csv')

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 或 CSV 文件')
  }
  return isExcel
}

// 导入成功回调
const handleImportSuccess = () => {
  ElMessage.success('导入成功')
  importDialogVisible.value = false
  fetchUserList()
}

// 导入失败回调
const handleImportError = () => {
  ElMessage.error('导入失败')
}
</script>
<style scoped="scoped">
.user-list-container {
  padding: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-search-form {
  margin-bottom: 20px;
}
.el-form-item__content {
  width: 100%;
}

.table-t ools {
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

.el-pagination .el-input-number .el-input__inner {
  text-align: center;
  padding: 0 5px;
}
</style>
