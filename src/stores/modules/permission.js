import { menusToRoutes } from '@/utils/menuToRoute'
import { getUserMenus } from '@/api/premission/menu'
import router from '@/router'
import { defineStore } from 'pinia'
import Layout from '@/views/layout/Layout.vue'

function addAsyncRoutes(routes, parentName = 'Layout') {
  routes.forEach((route) => {
    const routeCopy = { ...route }
    if (routeCopy.component === 'Layout') {
      routeCopy.component = Layout
    }
    router.addRoute(parentName, routeCopy)
    if (routeCopy.children && routeCopy.children.length > 0) {
      addAsyncRoutes(routeCopy.children, routeCopy.name)
    }
  })
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    asyncRoutes: [],
    isAsyncRoutesLoaded: false,
  }),
  actions: {
    setRoutes(routes) {
      this.routes = routes
    },
    setAddRoutes(routes) {
      this.addRoutes = routes
    },

    async loadAsyncRoutes() {
      try {
        const response = await getUserMenus()

        console.log('response 类型:', typeof response)
        console.log('API 返回的完整响应:', response)

        if (!response) {
          console.error('API 返回空响应')
          this.isAsyncRoutesLoaded = false
          return []
        }

        const menus = response.data
        console.log('response.data:', response.data)

        if (!menus || !Array.isArray(menus)) {
          console.error('菜单数据为空或格式错误:', menus)
          this.isAsyncRoutesLoaded = false
          return []
        }

        const accessRoutes = menusToRoutes(menus)
        addAsyncRoutes(accessRoutes)
        this.asyncRoutes = accessRoutes
        this.isAsyncRoutesLoaded = true

        return accessRoutes
      } catch (error) {
        console.error('加载异步路由失败:', error)
        this.isAsyncRoutesLoaded = false
        throw error
      }
    },

    resetPermissionState() {
      this.routes = []
      this.addRoutes = []
      this.asyncRoutes = []
      this.isAsyncRoutesLoaded = false
    },
  },
})
