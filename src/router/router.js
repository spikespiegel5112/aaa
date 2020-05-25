import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import InnerLayoutMobile from '@/views/InnerLayoutMobile'

/**
 * Note: 路由配置项
 *
 * hidden: true                   // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true               // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect           // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
    roles: ['admin','editor']    // 设置该路由进入的权限，支持多个权限叠加
    title: 'title'               // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'             // 设置该路由的图标，对应路径src/icons/svg
    breadcrumb: false            // 如果设置为false，则不会在breadcrumb面包屑中显示
  }
 */

// 公共路由
export const constantRoutes = [{
  "name": "orderMobile",
  "path": "",
  redirect: '/loginMobile',
  component: InnerLayoutMobile,
  // "alwaysShow": true,
  configurable: false,
  "meta": {
    "title": "移动端订单管理",
    "icon": "gear",
    functionaility: []
  },
  children: [{
    "name": "loginMobile",
    "path": "/loginMobile",
    component: () => import("@/views/orderMobile/loginMobile.vue"),
    configurable: false,
    // hidden: true,
    "meta": {
      "title": "移动端登录",
      "icon": "gear",
      functionaility: []
    },
  }, {

    "name": "createOrderMobile",
    "path": "/createOrderMobile",
    component: () => import("@/views/orderMobile/createOrderMobile.vue"),
    configurable: false,
    // hidden: true,
    "meta": {
      "title": "移动端创建订单",
      "icon": "gear",
      functionaility: []
    },
  }, {

    "name": "showQRCodeMobile",
    "path": "/showQRCodeMobile",
    component: () => import("@/views/orderMobile/showQRCodeMobile.vue"),
    configurable: false,
    // hidden: true,
    "meta": {
      "title": "移动端显示二维码",
      "icon": "gear",
      functionaility: []
    },
  }, {

    "name": "congratulationMobile",
    "path": "/congratulationMobile",
    component: () => import("@/views/orderMobile/congratulationMobile.vue"),
    configurable: false,
    // hidden: true,
    "meta": {
      "title": "支付成功",
      "icon": "gear",
      functionaility: []
    },
  }, {

    "name": "changePassword",
    "path": "/changePassword",
    component: () => import("@/views/orderMobile/changePassword.vue"),
    configurable: false,
    // hidden: true,
    "meta": {
      "title": "修改密码",
      "icon": "gear",
      functionaility: []
    }
  }]
}]


export default new Router({
  mode: 'history', // 去掉url中的#
  base: '/h5',
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})
