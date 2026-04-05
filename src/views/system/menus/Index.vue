<template>
  <div class="menu-list-container">
    <el-card>
      <!-- 工具栏 -->
      <div class="table-tools">
        <el-button type="primary" @click="handleAdd(null)"
          >新增根菜单</el-button
        >
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedRows.length"
          >批量删除</el-button
        >
      </div>

      <!-- 菜单树表格 -->
      <el-table
        :data="menuTree"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="菜单名称" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'info' : 'success'">
              {{ row.type === 0 ? '目录' : '菜单' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <component
              v-if="row.icon && iconMap[row.icon]"
              :is="iconMap[row.icon]"
              style="font-size: 20px; margin: 0 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_num" label="排序" width="60" />
        <el-table-column prop="permission" label="权限标识" />
        <el-table-column prop="hidden" label="隐藏" width="80">
          <template #default="{ row }">
            <el-tag :type="row.hidden === 1 ? 'warning' : 'success'">
              {{ row.hidden === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleAdd(row)"
              >新增子菜单</el-button
            >
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑菜单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="90px" ref="formRef">
        <el-form-item label="菜单名称" prop="name" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="路径" prop="path" required>
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item label="类型" prop="type" required>
          <el-radio-group v-model="form.type">
            <el-radio :value="0">目录</el-radio>
            <el-radio :value="1">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父菜单">
          <el-tree-select
            v-model="form.parent_id"
            :data="menuTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            clearable
            placeholder="请选择父菜单"
            :disabled="isEdit && !form.parent_id"
          />
        </el-form-item>
        <el-form-item label="组件路径" v-if="form.type === 1">
          <el-input v-model="form.component" />
        </el-form-item>
        <el-form-item label="图标">
          <el-popover
            placement="bottom"
            width="300"
            trigger="click"
            v-model:visible="iconPopoverVisible"
          >
            <div
              style="
                display: flex;
                flex-wrap: wrap;
                max-height: 240px;
                overflow-y: auto;
              "
            >
              <div
                v-for="(iconComp, iconName) in iconMap"
                :key="iconName"
                @click="selectIcon(iconName)"
                style="
                  width: 60px;
                  text-align: center;
                  margin: 4px;
                  cursor: pointer;
                "
              >
                <component :is="iconComp" style="font-size: 24px" />
                <div style="font-size: 12px">{{ iconName }}</div>
              </div>
            </div>
            <template #reference>
              <el-input
                v-model="form.icon"
                placeholder="请选择图标"
                readonly
                style="width: 200px"
              >
                <template #prefix>
                  <component
                    v-if="form.icon && iconMap[form.icon]"
                    :is="iconMap[form.icon]"
                    style="font-size: 20px"
                  />
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.order_num" :min="0" />
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="form.permission" />
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-switch v-model="form.hidden" :active-value="1" :inactive-value="0" />
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
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenuByIds,
} from '@/api/system/menu'
import * as Icons from '@element-plus/icons-vue'
const iconMap = Icons

const menuTree = ref([])
const selectedRows = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  path: '',
  component: '',
  parent_id: null,
  type: 0,
  icon: '',
  order_num: 0,
  permission: '',
  hidden: 0,
})
const formRef = ref(null)
const dialogTitle = computed(() => (isEdit.value ? '编辑菜单' : '新增菜单'))
const iconPopoverVisible = ref(false)

// 获取菜单树
const fetchMenuTree = () => {
  getMenuList().then((res) => {
    const list = res.data.records
    menuTree.value = buildTree(list)
  })
}

// 扁平转树
function buildTree(list) {
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  list.forEach((item) => {
    if (!item.parent_id) {
      roots.push(map[item.id])
    } else if (map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id])
    }
  })
  return roots
}

// 新增
const handleAdd = (parent) => {
  isEdit.value = false
  form.value = {
    name: '',
    path: '',
    component: '',
    parent_id: parent ? parent.id : null,
    type: 1,
    icon: '',
    order_num: 0,
    permission: '',
    hidden: 0,
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deleteMenuByIds([row.id]).then(() => {
      ElMessage.success('删除成功')
      fetchMenuTree()
    })
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的菜单')
    return
  }
  ElMessageBox.confirm('确定要批量删除选中菜单吗？', '提示', {
    type: 'warning',
  }).then(() => {
    deleteMenuByIds(selectedRows.value.map((r) => r.id)).then(() => {
      ElMessage.success('批量删除成功')
      fetchMenuTree()
    })
  })
}

// 多选
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 提交
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateMenu(form.value)
      ElMessage.success('编辑成功')
    } else {
      await createMenu(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchMenuTree()
  })
}

function selectIcon(iconName) {
  form.value.icon = iconName
  iconPopoverVisible.value = false
}

onMounted(() => {
  fetchMenuTree()
})
</script>

<style scoped>
.menu-list-container {
  padding: 10px;
}
.table-tools {
  margin: 15px 0;
}
.table-tools .el-button {
  margin-right: 10px;
}
</style>
