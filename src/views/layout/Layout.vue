<template>
  <div class="layout-wrapper">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="sidebar">
        <div class="logo-wrapper">
          <el-image :src="logoSrc" alt="Logo" class="logo" fit="contain" />
        </div>
        <el-menu
          :default-active="$route.path"
          mode="vertical"
          router
          class="sidebar-menu"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <recursive-menu :items="menuRoutes" />
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-content">
            <div class="header-left">
              <el-button
                type="text"
                @click="toggleSidebar"
                class="collapse-btn"
              >
                <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
              </el-button>
              <h2 class="module-name">{{ currentMenuName }}</h2>
            </div>

            <div class="header-right">
              <el-dropdown trigger="hover" class="user-dropdown">
                <div class="user-info">
                  <el-avatar
                    :size="36"
                    :src="getFullAvatarUrl(userStore.avatar)"
                  />
                  <span class="username">{{ userStore.name }}</span>
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">
                      <el-icon><User /></el-icon>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main class="main-content">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-container">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
              >
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbList"
                :key="item.path"
                :to="
                  index === breadcrumbList.length - 1
                    ? undefined
                    : { path: item.path }
                "
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore, usePermissionStore } from '@/stores'
import RecursiveMenu from './RecursiveMenu.vue'
import settings from '@/settings'
import {
  Fold,
  Expand,
  ArrowDown,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '200px'))

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// Logo
const logoSrc = new URL('@/assets/images/logo02.png', import.meta.url).href

// 当前菜单名称
const currentMenuName = computed(() => {
  return route.meta?.title || route.matched[0]?.meta?.title || '游戏代练平台'
})

// 菜单路由处理
function filterMenuRoutes(routes) {
  return routes
    .filter(
      (route) =>
        (route.meta?.type === 0 && route.children?.length > 0) ||
        route.meta?.type === 1
    )
    .map((route) => ({
      ...route,
      children:
        route.meta?.type === 0 && route.children?.length > 0
          ? filterMenuRoutes(route.children)
          : undefined,
    }))
}

function addFullPath(routes, parentPath = '') {
  return routes.map((route) => {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${parentPath}/${route.path}`.replace(/\/+/g, '/')

    return {
      ...route,
      fullPath,
      children:
        route.children?.length > 0
          ? addFullPath(route.children, fullPath)
          : undefined,
    }
  })
}

const menuRoutes = computed(() => {
  if (!permissionStore.isAsyncRoutesLoaded) return []
  const filtered = filterMenuRoutes(permissionStore.asyncRoutes)
  return addFullPath(filtered)
})

// 获取完整头像URL
const getFullAvatarUrl = (avatar) => {
  if (!avatar) return ''
  const trimmedAvatar = avatar.trim()
  return trimmedAvatar.toLowerCase().startsWith('http')
    ? trimmedAvatar
    : settings.imgBaseUrl + trimmedAvatar
}

// 面包屑导航
const breadcrumbList = computed(() => {
  const matched = route.matched.filter((item) => {
    // 过滤掉根路径和Layout组件
    return (
      item.meta &&
      item.meta.title &&
      item.path !== '/' &&
      item.name !== 'Layout'
    )
  })

  const breadcrumbs = []

  // 构建完整的层级路径
  matched.forEach((item) => {
    const title = item.meta.title
    const path = item.path

    if (title !== '首页') {
      breadcrumbs.push({
        title,
        path,
      })
    }
  })

  // 如果当前路由有父级菜单，需要从菜单数据中获取完整路径
  if (permissionStore.isAsyncRoutesLoaded) {
    const currentPath = route.path
    const fullPath = findMenuPath(permissionStore.asyncRoutes, currentPath)
    if (fullPath.length > 0) {
      return fullPath.map((item) => ({
        title: item.name || item.meta?.title,
        path: item.fullPath || item.path,
      }))
    }
  }

  return breadcrumbs
})

// 查找菜单完整路径 - 优化版本
const findMenuPath = (routes, targetPath, currentPath = []) => {
  for (const route of routes) {
    const newPath = [...currentPath, route]

    // 检查当前路由是否匹配
    if (route.path === targetPath || route.fullPath === targetPath) {
      return newPath
    }

    // 递归查找子路由
    if (route.children && route.children.length > 0) {
      const found = findMenuPath(route.children, targetPath, newPath)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

// 用户操作
const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  userStore.LogOut().then(() => {
    permissionStore.resetPermissionState()
    router.replace('/login')
  })
}
</script>

<style scoped>
.layout-wrapper {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #001529;
  transition: width 0.3s ease;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo-wrapper {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logo {
  height: 40px;
  width: auto;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: #001529;
  overflow-y: auto !important;
  overflow-x: hidden;
}

.sidebar-menu :deep(.el-menu) {
  border-right: none;
  background: #001529;
}

/* 强制菜单容器可滚动 */
.sidebar-menu :deep(.el-menu-vertical) {
  height: auto !important;
  max-height: none !important;
}

/* 自定义滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: #fff !important; /* 改为纯白色 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: #13c2c2 !important; /* 青色 */
  color: #fff !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #13c2c2 !important; /* 青色 */
  color: #fff !important;
}

/* 子菜单选中状态 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: #13c2c2 !important; /* 青色 */
  color: #fff !important;
}

/* 确保选中状态在所有情况下都生效 */
.sidebar-menu :deep(.el-menu-item[aria-selected='true']),
.sidebar-menu :deep(.el-menu-item.is-active),
.sidebar-menu :deep(.router-link-active .el-menu-item) {
  background: #13c2c2 !important; /* 青色 */
  color: #fff !important;
}

/* 确保子菜单项也是白色 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  color: #fff !important;
  background: rgba(0, 21, 41, 0.8) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background: #13c2c2 !important; /* 青色 */
  color: #fff !important;
}

/* 折叠状态下的图标颜色 */
.sidebar-menu :deep(.el-menu-item .el-icon),
.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  color: #fff !important;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  color: #666;
}

.module-name {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 修复头像黑色边框问题 */
.user-info :deep(.el-avatar) {
  border: none !important;
  outline: none !important;
}

.user-info :deep(.el-avatar img) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.dropdown-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.breadcrumb-container {
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.page-content {
  flex: 1;
}

.main-content {
  background: #f0f2f5;
  overflow-y: auto;
  height: calc(100vh - 60px);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 确保el-main有正确的高度 */
.main-content :deep(.el-main) {
  height: 100%;
  overflow-y: auto;
}
</style>
