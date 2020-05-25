import Cookies from 'js-cookie'

const TokenKey = 'Authorization'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function getCookie() {
  let temp=Cookies.get('Cookie')
  

  return temp
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
