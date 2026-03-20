// src/api/user-account/transaction.js
import request from '@/utils/request'

// 新版：所有参数都放 params
export function getTransactionList(params) {
  return request({
    url: '/server-user/transaction/transactions',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'get',
    params,
  })
}
