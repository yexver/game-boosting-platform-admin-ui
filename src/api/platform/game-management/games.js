import request from '@/utils/request'

/**
 * 游戏管理 API 接口文档
 *
 * 基础信息:
 * - 基础路径: /server-order/games
 * - 认证方式: Token认证 (isToken: true)
 * - 防重复提交: 关闭 (repeatSubmit: false)
 *
 * 接口列表:
 * 1. getGameList - 获取游戏列表
 * 2. createGame - 新增游戏
 * 3. updateGame - 更新游戏
 * 4. deleteGame - 删除游戏
 * 5. changeGameStatus - 切换游戏状态
 */

/**
 * 获取游戏列表
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum] - 页码，默认1
 * @param {number} [params.pageSize] - 每页数量，默认10
 * @param {string} [params.gameName] - 游戏名称（模糊查询）
 * @param {string} [params.gameType] - 游戏类型
 * @param {number} [params.status] - 游戏状态 (0: 禁用, 1: 启用)
 * @param {string} [params.startTime] - 开始时间
 * @param {string} [params.endTime] - 结束时间
 * @returns {Promise<Object>} 返回游戏列表数据
 * @example
 * // 获取所有游戏
 * getGameList()
 *
 * // 分页查询
 * getGameList({ pageNum: 1, pageSize: 20 })
 *
 * // 按名称搜索
 * getGameList({ gameName: '王者荣耀' })
 *
 * // 按状态筛选
 * getGameList({ status: 1 })
 */
export function getGameList(params) {
  return request({
    url: '/server-order/games',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'get',
    params,
  })
}

/**
 * 新增游戏
 * @param {Object|FormData} data - 游戏数据或FormData对象
 * @param {string} data.gameName - 游戏名称（必填）
 * @param {string} data.gameType - 游戏类型（必填）
 * @param {string} [data.description] - 游戏描述
 * @param {string|File} [data.icon] - 游戏图标URL或文件
 * @param {string} [data.coverImage] - 游戏封面图片URL
 * @param {number} [data.status=1] - 游戏状态 (0: 禁用, 1: 启用)
 * @param {number} [data.sortOrder=0] - 排序权重
 * @param {Object} [data.gameConfig] - 游戏配置信息
 * @returns {Promise<Object>} 返回创建结果
 * @example
 * createGame({
 *   gameName: '王者荣耀',
 *   status: 1
 * })
 */
export function createGame(data) {
  console.log(data instanceof FormData)
  return request({
    url: '/server-order/games',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data,
  })
}

/**
 * 更新游戏
 * @param {string|number} id - 游戏ID
 * @param {Object|FormData} data - 更新的游戏数据或FormData对象
 * @param {string} [data.gameName] - 游戏名称
 * @param {string|File} [data.icon] - 游戏图标URL或文件
 * @param {string} [data.coverImage] - 游戏封面图片URL
 * @param {number} [data.status] - 游戏状态 (0: 禁用, 1: 启用)
 * @param {number} [data.sortOrder] - 排序权重
 * @returns {Promise<Object>} 返回更新结果
 * @example
 * updateGame(1, {
 *   gameName: '王者荣耀-更新版',
 * })
 */
export function updateGame(id, data) {
  return request({
    url: `/server-order/games/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'put',
    data,
  })
}

/**
 * 删除游戏
 * @param {string|number} id - 游戏ID
 * @returns {Promise<Object>} 返回删除结果
 * @example
 * deleteGame(1)
 */
export function deleteGame(id) {
  return request({
    url: `/server-order/games/${id}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'delete',
  })
}

/**
 * 切换游戏状态
 * @param {string|number} id - 游戏ID
 * @param {number} status - 新状态 (0: 禁用, 1: 启用)
 * @returns {Promise<Object>} 返回状态切换结果
 * @example
 * changeGameStatus(1, 0) // 禁用游戏
 * changeGameStatus(1, 1) // 启用游戏
 */
export function changeGameStatus(id, status) {
  console.log('status', status)
  return request({
    url: `/server-order/games/${id}/status?status=${status}`,
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'patch',
  })
}

/**
 * 上传图片
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<Object>} 返回上传结果，包含图片URL
 * @example
 * const file = event.target.files[0]
 * uploadImage(file).then(res => {
 *   console.log('上传成功:', res.data) // 图片URL
 * })
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/server-order/upload/image',
    headers: {
      isToken: true,
      repeatSubmit: false,
      'Content-Type': 'multipart/form-data',
    },
    method: 'post',
    data: formData,
  })
}

/**
 * 获取游戏详情
 * @param {string|number} id - 游戏ID
 * @returns {Promise<Object>} 游戏详情（包含已绑定系统等信息）
 */
export function getGameDetail(id) {
  return request({
    url: `/server-order/games/getGameDetail/${id}`,
    method: 'get',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
  })
}
