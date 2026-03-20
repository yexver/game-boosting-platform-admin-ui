import request from '@/utils/request'

// 获取服务区列表
export function getServerList(params) {
  return request({
    url: 'server-order/servers',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'get',
    params,
  })
}

// 新增服务区
export function createServer(data) {
  return request({
    url: 'server-order/servers',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

// 更新服务区
export function updateServer(id, data) {
  return request({
    url: `server-order/servers/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'put',
    data,
  })
}

// 删除服务区
export function deleteServer(id) {
  return request({
    url: `server-order/servers/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'delete',
  })
}

// 切换服务区状态
export function changeServerStatus(id, status) {
  return request({
    url: `server-order/servers/${id}/status`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'patch',
    data: { status },
  })
}

// 批量导入服务区
export function importServers(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: 'server-order/servers/import',
    headers: {
      isToken: true,
      repeatSubmit: false,
      'Content-Type': 'multipart/form-data',
    },
    method: 'post',
    data: formData,
  })
}
