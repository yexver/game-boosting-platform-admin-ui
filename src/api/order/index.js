import request from '@/utils/request'

/**
 * 获取异常订单列表（待介入）
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum] - 页码，默认1
 * @param {number} [params.pageSize] - 每页数量，默认10
 * @param {string} [params.orderNo] - 订单号
 * @param {number} [params.status=8] - 订单状态，8为待介入
 * @returns {Promise<Object>} 返回订单列表数据
 */
// 获取订单列表
export function getOrderInfoList(data) {
  return request({
    url: 'server-order/orders/orderInfoList',
    method: 'get',
    params: data,
  })
}

/**
 * 介入订单
 * @param {string|number} orderId 订单ID
 * @returns {Promise<Object>}
 */
export function interveneOrder(orderId) {
  return request({
    url: '/server-order/orders/intervene',
    method: 'post',
    data: { orderId },
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

/**
 * 获取订单详情
 * @param {string|number} orderId
 * @returns {Promise<Object>}
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/server-order/orders/${orderId}`,
    method: 'get',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

/**
 * 获取订单消息列表
 * @param {string|number} orderId
 * @returns {Promise<Object>}
 */
export function getOrderMessages(orderId) {
  return request({
    url: '/server-order/messages/order-messages',
    method: 'get',
    params: { orderId },
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

/**
 * 仲裁订单
 * @param {Object} data { orderId, payAmount, depositAmount, remark }
 * @returns {Promise<Object>}
 */
export function arbitrateOrder(data) {
  return request({
    url: '/server-order/orders/arbitrate',
    method: 'post',
    data,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}
