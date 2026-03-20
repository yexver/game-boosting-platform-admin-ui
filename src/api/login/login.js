import request from '@/utils/request'

// 登录方法
export function login(phone, password, code, uuid) {
  const data = {
    phone,
    password,
    code,
    uuid,
  }
  return request({
    url: 'jmz-security/login',
    headers: {
      isToken: false,
      repeatSubmit: false,
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: data,
  })
}

// 注册方法
export function register(data) {
  return request({
    url: 'jmz-security/register',
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: 'post',
    data: {
      code: data.code,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
    },
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: 'server-user/getLoginUserInfo',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
  })
}

// 退出方法
export function logout() {
  return request({
    url: 'server-user/logout',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
  })
}
//getCodeImg
export const getCodeImg = () => {
  return request({
    url: 'jmz-security/captchaImage',
    method: 'get',
  })
}

// 发送短信验证码
export function sendSms(phone) {
  return request({
    url: 'jmz-security/sendSms',
    method: 'post',
    params: { phone },
  })
}

export default {
  login,
  getInfo,
  logout,
  getCodeImg,
}
