import router from './router/router'

import {
  errorRoutes
} from './router/router'
import store from '@/store/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false
})
import { Notify } from 'vant';

const mainRoutes = store.state.permission.routes

let result = errorRoutes


router.beforeEach(async (to, from, next) => {
  NProgress.start()
  store.commit('app/updateFromRoute', from)

  let userInfo = store.state.user.userInfo
  console.log('to.path1+++++', to.path)
  console.log('to.path1+++++', Object.keys(userInfo).length)

  if (!userInfo || Object.keys(userInfo).length === 0) {

    if (to.path !== '/loginMobile' && to.path !== '/changePassword' && to.path !== '/') {
      try {
        await store.dispatch('getUserInfo')
        next()
      } catch (error) {
        userInfo = null
      }

    } else {
      next()
    }

    // if (to.path !== '/loginMobile' && to.path !== '/') {
    //   userInfo = await store.dispatch('getUserInfo')
    //   next()
    // } else {
    //   next()
    // }
  } else {
    next()

  }




  // next({
  //   ...to,
  //   replace: true
  // }) // hack方法 确保addRoutes已完成
})

router.afterEach((to, from) => {
  console.log('finsh', to)
  NProgress.done()
})

router.onError(error => {


  console.log('router.onError', error)
})
