<template>
  <div v-if="!item.hidden" class="menu_item">
    <template
      v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <!-- <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" /> -->
          <!-- <img class="icon" :src="getIconByPic(item)" alt /> -->
          <i :class="'iconfont icon-' + getIconByIconFont(onlyOneChild)"></i>
          <span>{{onlyOneChild.meta.title}}</span>
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <!-- <img class="icon" :src="getIconByPic(item)" alt /> -->
        <i :class="'iconfont icon-' + getIconByIconFont(item)"></i>
        <span>{{item.meta.title}}</span>
        <!-- <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" /> -->
      </template>
      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="resolvePath(child.path)" class="nest-menu"></sidebar-item>
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    },
    getIconByIconFont(data) {

      const iconDictonary = [{
        name: 'dashboard',
        icon: 'dashboard'
      }, {
        name: 'user',
        icon: 'user'
      }, {
        name: 'userManagement',
        icon: 'usermanagement'
      }, {
        name: 'roleManagement',
        icon: 'rolemanagement'
      }, {
        name: 'createOrder',
        icon: 'createorder'
      }, {
        name: 'product',
        icon: 'product'
      }, {
        name: 'productmanagement',
        icon: 'productmanagement'
      }, {
        name: 'distributedProductsManagement',
        icon: 'productmanagement'
      }, {
        name: 'orderManagement',
        icon: 'ordermanagement'
      }, {
        name: 'authoritySettings',
        icon: 'authoritysettings'
      }, {
        name: 'merchant',
        icon: 'merchant'
      }, {
        name: 'merchantManagement',
        icon: 'merchantmanagement'
      }, {

        name: 'user',
        icon: 'user'
      }]
      let result = ''
      let iconData = iconDictonary.find(item => item.name === data.name)

      return iconData ? iconData.icon : 'functionaility'
    },
    getIconByPic(data) {



      const result = require('@/image/menu/' + icon + '.png')


      return result || ''
    }
  }
}
</script>