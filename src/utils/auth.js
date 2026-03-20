import Cookies from 'js-cookie'
const TokenKey = 'Admin-Token'

export function getLocalToken() {
  return Cookies.get(TokenKey)
}

export function setLocalToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeLocalToken() {
  return Cookies.remove(TokenKey)
}
