import request from '@/utils/request'

export const getUserInfoList = (data) => {
  return request({
    url: 'server-user/user/getUserInfoList',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

export const createUser = (data) => {
  return request({
    url: 'server-user/user/createUser',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

export const updateUser = (data) => {
  console.log('updateUser', data)
  return request({
    url: 'server-user/user/updateUser',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

export const deleteUserByIds = (data) => {
  return request({
    url: 'server-user/user/deleteUserByIds',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

export const resetUserPassword = (userId, password) => {
  return request({
    url: `server-user/user/${userId}/password?password=${password}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'put',
  })
}

export function getUserInfoById(userId) {
  return request({
    url: `server-user/user/getUserInfoById/${userId}`,
    method: 'post',
  })
}

// 导出用户数据
export const exportUsers = (data) => {
  return request({
    url: 'server-user/user/export',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
    responseType: 'blob', // 确保设置为blob
  })
}

// 导入用户数据
export const importUsers = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: 'server-user/user/import',
    headers: {
      isToken: true,
      repeatSubmit: false,
      'Content-Type': 'multipart/form-data',
    },
    method: 'post',
    data: formData,
  })
}
