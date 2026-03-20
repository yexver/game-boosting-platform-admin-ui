<template>
  <template v-for="item in items" :key="item.fullPath">
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="item.fullPath || item.path"
    >
      <el-icon v-if="item.meta?.icon">
        <component :is="getIconComponent(item.meta.icon)" />
      </el-icon>
      <span>{{ item.name }}</span>
    </el-menu-item>
    <el-sub-menu v-else :index="item.fullPath">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="getIconComponent(item.meta.icon)" />
        </el-icon>
        <span>{{ item.name }}</span>
      </template>
      <recursive-menu :items="item.children" />
    </el-sub-menu>
  </template>
</template>

<script setup>
import * as Icons from '@element-plus/icons-vue'

defineProps({ items: Array })

const iconMap = {
  dashboard: 'Odometer',
  setting: 'Setting',
}

const getIconComponent = (iconName) => {
  const mappedName = iconMap[iconName] || iconName
  return Icons[mappedName] || null
}
</script>
