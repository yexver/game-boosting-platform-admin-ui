import request from '@/utils/request'

// 获取用户菜单
export function getUserMenus() {
  return request({
    url: `server-user/menu/getUserMenus`,
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'post',
  })
}

// 获取菜单树
export function getMenuTree() {
  return request({
    url: '/server-user/menu/tree',
    method: 'get',
  })
}

// 获取角色菜单
export function getRoleMenus(roleId) {
  return request({
    url: `/server-user/role/${roleId}/menus`,
    method: 'get',
  })
}
