import request from '@/utils/request'

/**
 * 代练订单管理 API 接口文档
 *
 * 基础信息:
 * - 基础路径: /server-order/orders
 * - 认证方式: Token认证 (isToken: true)
 * - 防重复提交: 关闭 (repeatSubmit: false)
 */

// ==================== 查询接口 ====================

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum] - 页码，默认1
 * @param {number} [params.pageSize] - 每页数量，默认10
 * @param {string} [params.orderNo] - 订单号（精确查询）
 * @param {number} [params.status] - 订单状态
 * @param {number} [params.gameId] - 游戏ID
 * @param {string} [params.beginCreateTime] - 开始创建时间（YYYY-MM-DD）
 * @param {string} [params.endCreateTime] - 结束创建时间（YYYY-MM-DD）
 * @param {string} [params.minAmount] - 最小金额
 * @param {string} [params.maxAmount] - 最大金额
 * @param {string} [params.managerId] - 客服ID（介入订单查询用）
 * @returns {Promise<Object>} 返回订单列表数据
 */
export function getOrderInfoList(data) {
  return request({
    url: '/server-order/orders/orderInfoList',
    method: 'get',
    params: data,
  })
}

/**
 * 获取订单详情
 * @param {string|number} orderId - 订单ID
 * @returns {Promise<Object>} 返回订单详情（包含发布者、接手者、状态日志等）
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
 * @param {string|number} orderId - 订单ID
 * @returns {Promise<Object>} 返回订单消息列表
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
 * 获取订单统计信息
 * @param {Object} params - 查询参数
 * @param {string} [params.beginTime] - 开始时间
 * @param {string} [params.endTime] - 结束时间
 * @param {number} [params.gameId] - 游戏ID
 * @returns {Promise<Object>} 返回订单统计数据
 */
export function getOrderStatistics(params) {
  return request({
    url: '/server-order/orders/statistics',
    method: 'get',
    params,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

// ==================== 操作接��� ====================

/**
 * 介入订单
 * @param {string|number} orderId - 订单ID
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
 * 仲裁订单
 * @param {Object} data - 仲裁数据
 * @param {number} data.orderId - 订单ID
 * @param {number} data.payAmount - 订单金额支付
 * @param {number} data.depositAmount - 保证金支付
 * @param {string} data.remark - 仲裁说明
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

/**
 * 批量删除订单
 * @param {Array<number>} ids - 订单ID数组
 * @returns {Promise<Object>}
 */
export function batchDeleteOrders(ids) {
  return request({
    url: '/server-order/orders/batch-delete',
    method: 'post',
    data: { ids },
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

/**
 * 修改订单备注
 * @param {Object} data - 修改数据
 * @param {number} data.orderId - 订单ID
 * @param {string} data.remark - 备注内容
 * @returns {Promise<Object>}
 */
export function updateOrderRemark(data) {
  return request({
    url: '/server-order/orders/remark',
    method: 'put',
    data,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}

// ==================== 导出接口 ====================

/**
 * 导出订单列表
 * @param {Object} params - 查询参数（同 getOrderInfoList）
 * @returns {Promise<Blob>} 返回 Excel 文件 Blob
 */
export function exportOrders(params) {
  return request({
    url: '/server-order/orders/export',
    method: 'get',
    params,
    responseType: 'blob',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}