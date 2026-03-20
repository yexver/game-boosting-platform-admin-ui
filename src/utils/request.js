import axios from 'axios'
import { getLocalToken } from '@/utils/auth'
import { tansParams } from '@/utils/utils'
import cache from '@/plugins/cache'
import {
  ElNotification as Notification,
  ElMessageBox as MessageBox,
  ElMessage as Message,
  // ElLoading as Loading
} from 'element-plus'
import { useUserStore } from '@/stores'

// 是否显示重新登录
export let isRelogin = { show: false }

//axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    //    console.log('headers:', config.headers)
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    if (getLocalToken() && !isToken) {
      // console.log('Token:', getToken()) // 调试信息
      config.headers['Authorization'] = getLocalToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // console.log('Request Headers:', config.headers) // 调试信息
    // console.log('Origin:', window.location.origin) // 调试信息
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    // 防重复提交
    if (
      isRepeatSubmit &&
      (config.method === 'post' || config.method === 'put')
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === 'object'
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      }
      const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
      const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(
          `[${config.url}]: ` +
            '请求数据大小超出允许的5M限制，无法进行防重复提交验证。'
        )
        return config
      }
      const sessionObj = cache.session.getJSON('sessionObj')
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ''
      ) {
        cache.session.setJSON('sessionObj', requestObj)
      } else {
        const url = sessionObj.url // 请求地址
        const data = sessionObj.data // 请求数据
        const time = sessionObj.time // 请求时间
        const interval = 1000 // 间隔时间(ms)，小于此时间视为重复提交
        if (
          data === requestObj.data &&
          requestObj.time - time < interval &&
          url === requestObj.url
        ) {
          const message = '数据正在处理，请勿重复提交'
          console.warn(`[${url}]: ` + message)
          return Promise.reject(new Error(message))
        } else {
          cache.session.setJSON('sessionObj', requestObj)
        }
      }
    }
    return config
  },
  (error) => {
    console.log(error)
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    // const msg = errorCode[code] || res.data.msg || errorCode.default
    const msg = res.data.msg
    // 二进制数据则直接返回
    if (
      res.request.responseType === 'blob' ||
      res.request.responseType === 'arraybuffer'
    ) {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        MessageBox.confirm(
          '登录状态已过期，您可以继续留在该页面，或者重新登录',
          '系统提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
          isRelogin.show = false
          const userStore = useUserStore()
          userStore.FedLogOut().then(() => {
            location.href = '/index'
          })
        })
      }
      return Promise.reject(
        new Error('无效的会话，或者会话已过期 ，请重新登录。')
      )
    } else if (code === 403) {
      Message({ message: '权限不够', type: 'error' })
      return Promise.reject(new Error('权限不够'))
    } else if (code === 500) {
      Message({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      Message({ message: msg, type: 'warning' })
      return Promise.reject(new Error('error'))
    } else if (code !== 200) {
      Notification.error({ title: msg })
      return Promise.reject(new Error('error'))
    } else {
      return res.data
    }
  },
  (error) => {
    console.log('err' + error)
    let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    Message({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

export default service
