import request from '@/utils/request'

// 获取系统列表
export function getSystemList(params) {
  return request({
    url: 'server-order/systems',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'get',
    params,
  })
}

// 新增系统
export function createSystem(data) {
  const isFormData = data instanceof FormData
  return request({
    url: 'server-order/systems',
    headers: {
      isToken: true,
      repeatSubmit: false,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    method: 'post',
    data,
  })
}

// 更新系统
export function updateSystem(id, data) {
  const isFormData = data instanceof FormData
  return request({
    url: `server-order/systems/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    method: 'put',
    data,
  })
}

// 删除系统
export function deleteSystem(id) {
  return request({
    url: `server-order/systems/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'delete',
  })
}
