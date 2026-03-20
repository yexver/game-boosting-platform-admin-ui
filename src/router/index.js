import { createRouter, createWebHistory } from 'vue-router'
import { RouterView } from 'vue-router'

export function menusToRoutes(menus) {
  const routes = []

  menus.forEach((menu) => {
    const route = {
      path: menu.path.startsWith('/') ? menu.path : `/${menu.path}`,
      name: menu.name,
      meta: {
        title: menu.name,
        icon: menu.icon,
        hidden: !!menu.hidden,
        alwaysShow: !!menu.alwaysShow,
        permission: menu.permission,
        orderNum: menu.orderNum,
        type: menu.type,
      },
      redirect: menu.redirect || undefined,
    }

    if (menu.type === 0) {
      // 目录节点，component 设为 RouterView，避免嵌套 Layout
      route.component = RouterView
      route.children = Array.isArray(menu.children)
        ? menusToRoutes(menu.children)
        : []
    } else if (menu.type === 1) {
      route.component = () =>
        import(/* @vite-ignore */ menu.component.replace(/^@/, '/src'))
    }

    routes.push(route)
  })

  return routes
}

// Layout component

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/views/layout/Layout.vue'),
      redirect: '/home',
      children: [
        {
          path: 'home',
          component: () => import('@/views/home/Index.vue'),
          meta: { title: '首页' },
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/login/UserLogin.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      component: () => import('@/views/login/UserRegister.vue'),
      meta: { title: '注册' },
    },
  ],
})

export default router
