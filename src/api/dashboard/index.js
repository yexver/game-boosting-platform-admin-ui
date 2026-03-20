import request from '@/utils/request'

// 1. 新增用户数折线图
export function getUserAddTrend(params) {
  return request({
    url: '/server-user/dashboard/user-add-trend',
    method: 'get',
    params,
  })
}

// 2. 游戏订单分布
export function getGameOrderDistribution(params) {
  return request({
    url: '/server-order/dashboard/game-order-distribution',
    method: 'get',
    params,
  })
}

// 3. 平台收入趋势
export function getIncomeTrend(params) {
  return request({
    url: '/server-order/dashboard/income-trend',
    method: 'get',
    params,
  })
}

// 4. 订单状态占比
export function getOrderStatusPie(params) {
  return request({
    url: '/server-order/dashboard/order-status-pie',
    method: 'get',
    params,
  })
}

// 5. 用户总数和今日新增
export function getUserStats(params) {
  return request({
    url: '/server-user/dashboard/user-stats',
    method: 'get',
    params,
  })
}
