import request from '@/utils/request'

// 获取角色列表
export function getRoleList(params) {
  return request({
    url: '/server-user/role',
    method: 'get',
    params,
  })
}

// 获取所有角色ID和名称列表
export function getAllRoleIdNameList() {
  return request({
    url: '/server-user/role/all',
    method: 'get',
  })
}

// 根据ID获取角色详情
export function getRoleById(roleId) {
  return request({
    url: `/server-user/role/${roleId}`,
    method: 'get',
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/server-user/role',
    method: 'post',
    data,
  })
}

// 更新角色
export function updateRole(data) {
  return request({
    url: `/server-user/role/${data.id}`,
    method: 'put',
    data,
  })
}

// 删除角色
export function deleteRoleByIds(ids) {
  return request({
    url: '/server-user/role',
    method: 'delete',
    data: ids,
  })
}

// 获取角色权限
export function getRolePermissions(roleId) {
  return request({
    url: `/server-user/role/${roleId}/permissions`,
    method: 'get',
  })
}

// 分配角色权限
export function assignRolePermissions(data) {
  return request({
    url: `/server-user/role/${data.roleId}/permissions`,
    method: 'post',
    data: data.permissionIds,
  })
}

// 获取角色菜单
export function getRoleMenus(roleId) {
  return request({
    url: `/server-user/role/${roleId}/menus`,
    method: 'get',
  })
}

// 分配角色菜单
export function assignRoleMenus(data) {
  return request({
    url: `/server-user/role/${data.roleId}/menus`,
    method: 'post',
    data: data.menuIds,
  })
}
