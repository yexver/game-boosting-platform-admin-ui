import request from '@/utils/request'

// 获取菜单列表
export function getMenuList(params) {
  return request({
    url: '/server-user/menu',
    method: 'get',
    params,
  })
}

// 获取菜单树
export function getMenuTree() {
  return request({
    url: '/server-user/menu/tree',
    method: 'get',
  })
}

// 根据ID获取菜单详情
export function getMenuById(menuId) {
  return request({
    url: `/server-user/menu/${menuId}`,
    method: 'get',
  })
}

// 创建菜单
export function createMenu(data) {
  return request({
    url: '/server-user/menu',
    method: 'post',
    data,
  })
}

// 更新菜单
export function updateMenu(data) {
  return request({
    url: `/server-user/menu/${data.id}`,
    method: 'put',
    data,
  })
}

// 删除菜单
export function deleteMenuByIds(ids) {
  return request({
    url: '/server-user/menu',
    method: 'delete',
    data: ids,
  })
}
