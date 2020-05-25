import Vue from 'vue'
import moment from 'moment'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets


import App from './App'
import store from './store/store'
import router from './router/router'
// import permission from './directive/permission'
import service from './utils/request'
import {
  baseUrl
} from './utils/request'
import util from './utils/utils';

import '@/sassmobile/index.scss' // global css

import './assets/icons' // icon
import './permission' // permission control




Vue.use(util);

// 全局方法挂载
Vue.prototype.$baseUrl = baseUrl

Vue.prototype.$http = service;
Vue.prototype.$moment = moment;
Vue.prototype.$cookies = Cookies

// 全局组件挂载

// Vue.use(permission)


// Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
