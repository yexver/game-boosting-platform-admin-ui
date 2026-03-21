import request from '@/utils/request'

// 获取用户实名认证信息
export function getIdentityInfo() {
  return request({
    url: 'server-user/identity/info',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'get',
  })
}

// 提交实名认证
export function submitIdentity(data) {
  const formData = new FormData()
  formData.append('realName', data.realName)
  formData.append('idCardNumber', data.idCardNumber)
  formData.append('idCardFront', data.idCardFront)
  formData.append('idCardBack', data.idCardBack)
  if (data.facePhoto) {
    formData.append('facePhoto', data.facePhoto)
  }

  return request({
    url: 'server-user/identity/submit',
    headers: {
      isToken: true,
      repeatSubmit: false,
      'Content-Type': 'multipart/form-data',
    },
    method: 'post',
    data: formData,
  })
}

// 获取实名认证列表（管理员用）
export function getIdentityList(params) {
  return request({
    url: 'server-user/identity/list',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data: params,
  })
}

// 审核实名认证（管理员用）
export function auditIdentity(data) {
  return request({
    url: 'server-user/identity/audit',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}
