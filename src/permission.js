import router from './router'
//import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getLocalToken } from '@/utils/auth'
import { useUserStore } from '@/stores'
//import { isRelogin } from '@/utils/request'
//import useUserStore from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { getCurrentInstance } from 'vue'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

router.beforeEach(async (to) => {
  // 获取全局 pinia 实例
  const app = getCurrentInstance()?.appContext.app
  const pinia = app?._context.provides.pinia
  const permissionStore = usePermissionStore(pinia)
  NProgress.start()
  if (getLocalToken()) {
    const userStore = useUserStore(pinia)
    // 判断是否已加载用户信息（可根据userId或name等字段）
    if (!userStore.userId && typeof userStore.GetInfo === 'function') {
      await userStore.GetInfo()
    }
    if (to.path === '/login') {
      NProgress.done()
      // 跳转到首页
      return '/home'
    } else if (whiteList.indexOf(to.path) !== -1) {
      return true
    } else {
      if (!permissionStore.isAsyncRoutesLoaded) {
        await permissionStore.loadAsyncRoutes()
        return { ...to, replace: true }
      }
      return true
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      return true
    } else {
      NProgress.done()
      return `/login?redirect=${to.fullPath}`
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
