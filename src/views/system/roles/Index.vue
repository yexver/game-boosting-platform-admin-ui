<template>
  <div class="role-list-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="90px" class="role-search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="角色ID">
              <el-input
                v-model="searchForm.roleId"
                placeholder="请输入角色ID"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色名称">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入角色名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色标识">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入角色标识"
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
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedRows.length"
        >
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>

      <!-- 角色表格 -->
      <el-table :data="roles" border @selection-change="handleSelectionChange">
        <!-- 复选框列 -->
        <el-table-column type="selection" width="55" />

        <el-table-column
          prop="id"
          label="角色ID"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column prop="name" label="角色名称" show-overflow-tooltip />
        <el-table-column
          prop="keyword"
          label="角色标识"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="角色描述"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200">
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
                  <el-dropdown-item command="assignPermissions"
                    >分配权限</el-dropdown-item
                  >
                  <el-dropdown-item command="assignMenus"
                    >分配菜单</el-dropdown-item
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="roleDialogVisible" :title="dialogTitle" width="50%">
      <el-form :model="roleForm" label-width="90px" ref="roleFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色标识" prop="keyword">
              <el-input
                v-model="roleForm.keyword"
                placeholder="请输入角色标识"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="角色描述" prop="description">
              <el-input
                v-model="roleForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入角色描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelRole">取 消</el-button>
          <el-button type="primary" @click="submitRole">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
      <span>确定要删除该角色吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="confirmDeleteRole">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 权限分配抽屉 -->
    <el-drawer
      v-model="permissionDialogVisible"
      :title="`分配权限 - ${currentAssignRoleName}`"
      direction="rtl"
      size="60%"
      :with-header="true"
    >
      <el-checkbox-group v-model="checkedPermissions">
        <el-checkbox
          v-for="item in permissionList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitPermissionAssignment"
            >确 定</el-button
          >
        </div>
      </template>
    </el-drawer>

    <!-- 菜单分配抽屉 -->
    <el-drawer
      v-model="menuDialogVisible"
      :title="`分配菜单 - ${currentAssignMenuRoleName}`"
      direction="rtl"
      size="60%"
      :with-header="true"
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        :default-checked-keys="checkedMenus"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="menuDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitMenuAssignment"
            >确 定</el-button
          >
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRoleByIds,
  getRolePermissions,
  assignRolePermissions,
  getRoleMenus,
  assignRoleMenus,
} from '@/api/system/role'
import { getMenuTree } from '@/api/premission/menu'
import { listAllPermissions } from '@/api/system/permission'

// 角色列表数据
const roles = ref([])

// 当前分页条件
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单数据
const searchForm = ref({
  roleId: '',
  name: '',
  keyword: '',
})

// 搜索操作
const handleSearch = () => {
  fetchRoleList()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    roleId: '',
    name: '',
    keyword: '',
  }
  fetchRoleList()
}

// 角色表单相关
const roleDialogVisible = ref(false)
const roleForm = ref({
  name: '',
  keyword: '',
  description: '',
})
const isEdit = ref(false)
const currentRoleId = ref(null)

// 计算对话框标题
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑角色' : '新增角色'
})

// 新增角色
const handleAdd = () => {
  isEdit.value = false
  roleForm.value = {
    name: '',
    keyword: '',
    description: '',
  }
  roleDialogVisible.value = true
}

// 编辑角色
const handleEdit = (index, row) => {
  isEdit.value = true
  currentRoleId.value = row.id
  roleForm.value = { ...row }
  roleDialogVisible.value = true
}

// 取消角色操作
const handleCancelRole = () => {
  roleDialogVisible.value = false
  roleForm.value = {
    name: '',
    keyword: '',
    description: '',
  }
}

// 提交角色表单
const submitRole = () => {
  if (!roleForm.value.name || !roleForm.value.keyword) {
    ElMessage.warning('请填写角色名称和角色标识')
    return
  }

  if (isEdit.value) {
    updateRole({
      id: currentRoleId.value,
      ...roleForm.value,
    }).then((res) => {
      if (res.code === 200) {
        ElMessage.success('编辑角色成功')
        roleDialogVisible.value = false
        fetchRoleList()
      }
    })
  } else {
    createRole(roleForm.value).then((res) => {
      if (res.code === 200) {
        ElMessage.success('新增角色成功')
        roleDialogVisible.value = false
        fetchRoleList()
      }
    })
  }
}

// 删除相关
const deleteDialogVisible = ref(false)
const roleToDelete = ref(null)

// 删除角色
const handleDelete = (index, row) => {
  roleToDelete.value = row
  deleteDialogVisible.value = true
}

// 确认删除角色
const confirmDeleteRole = () => {
  const ids = Array.isArray(roleToDelete.value.id)
    ? roleToDelete.value.id
    : [roleToDelete.value.id]
  deleteRoleByIds(ids).then((res) => {
    if (res.code === 200) {
      ElMessage.success('删除角色成功')
      deleteDialogVisible.value = false
      fetchRoleList()
    }
  })
}

// 批量删除角色
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的角色')
    return
  }
  roleToDelete.value = { id: selectedRows.value.map((row) => row.id) }
  deleteDialogVisible.value = true
}

// 存储当前选中的行
const selectedRows = ref([])

// 多选变更时触发
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 获取角色列表
const fetchRoleList = () => {
  const params = {
    current: currentPage.value,
    size: pageSize.value,
    ...(searchForm.value.roleId && { roleId: searchForm.value.roleId }),
    ...(searchForm.value.name && { name: searchForm.value.name }),
    ...(searchForm.value.keyword && { keyword: searchForm.value.keyword }),
  }

  getRoleList(params)
    .then((res) => {
      if (res.code === 200) {
        roles.value = res.data.records
        total.value = Number(res.data.total)
        currentPage.value = Number(res.data.current)
        pageSize.value = Number(res.data.size)
      }
    })
    .catch((error) => {
      console.error('获取角色列表失败:', error)
      roles.value = []
      total.value = 0
    })
}

// 权限分配相关
const permissionDialogVisible = ref(false)
const permissionList = ref([]) // 权限平铺列表
const checkedPermissions = ref([])
const currentAssignRoleId = ref(null)
const currentAssignRoleName = ref('')

// 菜单分配相关
const menuDialogVisible = ref(false)
const menuTree = ref([])
const checkedMenus = ref([])
const currentAssignMenuRoleId = ref(null)
const currentAssignMenuRoleName = ref('')
const menuTreeRef = ref(null)

// 更多操作
const handleMoreCommand = (command, index, row) => {
  switch (command) {
    case 'assignPermissions':
      openPermissionDialog(row.id, row.name)
      break
    case 'assignMenus':
      currentAssignMenuRoleId.value = row.id
      openMenuDialog(row.id, row.name)
      break
    default:
      break
  }
}

// 打开权限分配对话框
const openPermissionDialog = async (roleId, roleName) => {
  currentAssignRoleId.value = roleId
  currentAssignRoleName.value = roleName || ''
  const res = await listAllPermissions()
  if (res.code === 200) {
    permissionList.value = res.data
    const res2 = await getRolePermissions(roleId)
    if (res2.code === 200) {
      checkedPermissions.value = res2.data.map((item) =>
        typeof item === 'object' ? item.id : item
      )
    } else {
      checkedPermissions.value = []
    }
    permissionDialogVisible.value = true
  }
}

// 提交权限分配
const submitPermissionAssignment = () => {
  assignRolePermissions({
    roleId: currentAssignRoleId.value,
    permissionIds: checkedPermissions.value,
  }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('权限分配成功')
      permissionDialogVisible.value = false
    }
  })
}

// 打开菜单分配对话框
const openMenuDialog = (roleId, roleName) => {
  currentAssignMenuRoleName.value = roleName || ''
  // 获取菜单列表（包含parent_id）
  getMenuTree()
    .then((res) => {
      if (res.code === 200) {
        // 转换为树形结构
        menuTree.value = convertToTree(res.data)
      }
    })
    .catch((error) => {
      // 可以保留错误日志
      console.error('获取菜单列表失败:', error)
    })

  // 获取角色已有菜单
  getRoleMenus(roleId)
    .then((res) => {
      if (res.code === 200) {
        checkedMenus.value = res.data.map((item) => item.id)
      }
    })
    .catch((error) => {
      console.error('获取角色菜单失败:', error)
    })

  menuDialogVisible.value = true
}

// 将扁平菜单数据转换为树形结构
const convertToTree = (flatData) => {
  const map = {}
  const result = []

  // 创建映射表
  flatData.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })

  // 构建树形结构
  flatData.forEach((item) => {
    const node = map[item.id]
    if (item.parentId === 0 || !item.parentId) {
      // 根节点
      result.push(node)
    } else {
      // 子节点
      const parent = map[item.parentId]
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return result
}

// 提交菜单分配
const submitMenuAssignment = () => {
  if (!menuTreeRef.value) {
    ElMessage.error('菜单树组件未加载')
    return
  }

  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

  // 确保所有ID都是数字类型
  const numericMenuIds = allCheckedKeys.map((id) => Number(id))

  assignRoleMenus({
    roleId: currentAssignMenuRoleId.value,
    menuIds: numericMenuIds,
  }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('菜单分配成功')
      menuDialogVisible.value = false
    }
  })
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchRoleList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchRoleList()
}

onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped="scoped">
.role-list-container {
  padding: 10px;
}

.role-search-form {
  margin-bottom: 20px;
}

.el-form-item__content {
  width: 100%;
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

.el-pagination .el-input-number .el-input__inner {
  text-align: center;
  padding: 0 5px;
}
</style>
