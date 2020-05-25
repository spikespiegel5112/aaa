import axios from 'axios'
import Router from '../router/router'
import Store from '../store/store'

// import {
//   Notification,
//   MessageBox,
//   Message
// } from 'element-ui'
import store from '@/store/store'
import { Notify, Dialog } from 'vant';



axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: process.env.VUE_APP_BASE_API,
  baseURL: process.env.NODE_ENV === "production" ? process.env.VUE_APP_BASE_API + '/cretech' : '/cretech',
  // baseURL: 'http://122.112.224.131:8090',

  // 超时
  timeout: 10000,
  withCredentials: true
})
// request拦截器
service.interceptors.request.use(config => {
  // config.headers['crossDomain'] = true
  // config.headers['Authorization'] = '';


  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})


// 响应拦截器
service.interceptors.response.use(res => {

  let result
  let loginFlag = localStorage.getItem('loginFlag')


  // res = res.data ? res.data : res
  if (typeof res.data === 'string') {

    return Promise.reject(res.data)
  }
  const handleLogout = () => {
    

    if (Boolean(loginFlag) === true) {
      
      loginFlag = false
      localStorage.removeItem('loginFlag')
      Dialog.alert({
        title: '提示',
        message: '当前已退出登录，请重新登录',
      }).then(() => {
        Router.push({
          path: '/loginMobile'
        })
      });


    }

  }
  const code = res.data ? res.data.respCode : res.respCode
  const message = res.data ? res.data.respMsg : res.respMsg
  switch (code) {
    case '00':
      result = res.data
      break;
    case '01':
      // handleLogout()
      return Promise.reject(message)
    case '03':
      return Promise.reject(message)
    case '11':
      return Promise.reject(message)
    case '12':
      return Promise.reject(message)
    case '13':
      return Promise.reject(message)
    case '14':
      return Promise.reject(message)
    case '04':
      return Promise.reject(message)
    case '90':
      return Promise.reject(message)
    case '97':
      Notify({
        type: 'error',
        message: 'message',
        duration: 5 * 1000,
      });
      return Promise.reject(message)
    case '98':
      const fromRouteData = Store.state.app.fromRoute

      if (fromRouteData.path === '/loginMobile' || fromRouteData.path === '/') {
        localStorage.removeItem('loginFlag')
        handleLogout()
      } else {

        handleLogout()
      }
      // Router.push({
      //   name: 'loginMobile'
      // })
      return Promise.reject(message)
    case '99':
      return Promise.reject(message)
    default:
      result = res.data || res

  }


  return result
}, error => {
  console.log('err' + error)
  Notify({
    message: error,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(error)
})

export default service

export const baseUrl = process.env.VUE_APP_BASE_API
