import request from '@/utils/request'

// 获取账户列表
export function getAccountList(params) {
  return request({
    url: '/server-account/account/list',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'post',
    data: params,
  })
}

// 获取账户详情
export function getAccountDetail(id) {
  return request({
    url: `/server-account/account/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'get',
  })
}

// 账户余额调整
export function adjustAccountBalance(data) {
  return request({
    url: '/server-account/account/adjust',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'post',
    data,
  })
}

// 获取账户流水
export function getAccountTransactions(userId, params) {
  return request({
    url: `/server-account/account/${userId}/transactions`,
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'get',
    params,
  })
}
