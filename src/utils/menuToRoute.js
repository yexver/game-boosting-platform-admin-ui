import { RouterView } from 'vue-router'

export function menusToRoutes(menus, isTop = true) {
  // 加判空
  if (!menus || !Array.isArray(menus)) {
    return []
  }
  const routes = []

  menus.forEach((menu) => {
    const route = {
      path: isTop
        ? menu.path.startsWith('/')
          ? menu.path
          : `/${menu.path}`
        : menu.path,
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
      route.component = RouterView
      route.children = Array.isArray(menu.children)
        ? menusToRoutes(menu.children, false)
        : []
    } else if (menu.type === 1) {
      route.component = () =>
        import(/* @vite-ignore */ menu.component.replace(/^@/, '/src'))
      // 递归处理 type:1 的 children（如果有）
      if (Array.isArray(menu.children) && menu.children.length > 0) {
        route.children = menusToRoutes(menu.children, false)
      }
    }

    routes.push(route)
  })

  return routes
}
