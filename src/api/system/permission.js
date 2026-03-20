import request from '@/utils/request'

// 获取所有权限列表
export function listAllPermissions(params) {
  return request({
    url: '/server-user/permission/all',
    method: 'get',
    params,
  })
}

// 获取权限列表
export function getPermissionList(params) {
  return request({
    url: '/server-user/permission',
    method: 'get',
    params,
  })
}

// 根据ID获取权限详情
export function getPermissionById(permissionId) {
  return request({
    url: `/server-user/permission/${permissionId}`,
    method: 'get',
  })
}

// 创建权限
export function createPermission(data) {
  return request({
    url: '/server-user/permission',
    method: 'post',
    data,
  })
}

// 更新权限
export function updatePermission(data) {
  return request({
    url: `/server-user/permission/${data.id}`,
    method: 'put',
    data,
  })
}

// 删除权限
export function deletePermissionByIds(ids) {
  return request({
    url: '/server-user/permission',
    method: 'delete',
    data: ids,
  })
}
