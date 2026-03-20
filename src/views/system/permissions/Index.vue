<template>
  <div class="permission-list-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="权限名称">
          <el-input v-model="searchForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="标识">
          <el-input v-model="searchForm.keyword" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="table-tools">
        <el-button type="primary" @click="handleAdd">新增权限</el-button>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedRows.length"
          >批量删除</el-button
        >
      </div>

      <!-- 权限表格 -->
      <el-table
        :data="permissions"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="keyword" label="标识" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, prev, pager, next, sizes, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑权限弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="权限名称" prop="name" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="标识" prop="keyword" required>
          <el-input v-model="form.keyword" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermissionByIds,
} from '@/api/system/permission'

// 列表数据
const permissions = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(5)
const selectedRows = ref([])

// 搜索表单
const searchForm = ref({
  name: '',
  keyword: '',
})

// 查询
const handleSearch = () => {
  fetchPermissionList()
}
const resetSearch = () => {
  searchForm.value = { name: '', keyword: '' }
  fetchPermissionList()
}

// 获取权限列表
const fetchPermissionList = () => {
  getPermissionList({
    current: currentPage.value,
    size: pageSize.value,
    ...searchForm.value,
  }).then((res) => {
    if (res.code === 200) {
      permissions.value = res.data.records || res.data // 兼容分页/不分页
      total.value = Number(res.data.total || res.data.length || 0) // 强制转数字
    }
  })
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 通常切换每页数量时重置到第一页
  fetchPermissionList()
}
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchPermissionList()
}

// 多选
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 新增/编辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', keyword: '', description: '' })
const formRef = ref(null)
const dialogTitle = computed(() => (isEdit.value ? '编辑权限' : '新增权限'))

const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', keyword: '', description: '' }
  dialogVisible.value = true
}
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updatePermission(form.value)
      ElMessage.success('编辑成功')
    } else {
      await createPermission(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchPermissionList()
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该权限吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deletePermissionByIds([row.id]).then(() => {
      ElMessage.success('删除成功')
      fetchPermissionList()
    })
  })
}
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的权限')
    return
  }
  ElMessageBox.confirm('确定要批量删除选中权限吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deletePermissionByIds(selectedRows.value.map((r) => r.id)).then(() => {
      ElMessage.success('批量删除成功')
      fetchPermissionList()
    })
  })
}

onMounted(() => {
  fetchPermissionList()
})
</script>

<style scoped>
.permission-list-container {
  padding: 10px;
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
