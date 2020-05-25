<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg"
        :text-color="variables.menuText" :active-text-color="variables.menuActiveText" :unique-opened="true"
        :collapse-transition="false" mode="vertical">
        <sidebar-item v-for="route in permission_routes[0].children" :key="route.path" :item="route"
          :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
  import {
    mapGetters
  } from 'vuex'
  import Logo from './Logo'
  import SidebarItem from './SidebarItem'
  import variables from '@/sass/variables.scss'

  export default {
    components: {
      SidebarItem,
      Logo
    },
    data() {
      return {
        routeData: []
      }
    },
    computed: {
      ...mapGetters([
        'permission_routes',
        'sidebar',
        'userInfo'
      ]),
      activeMenu() {
        const route = this.$route
        const {
          meta,
          path
        } = route
        // if set path, the sidebar will highlight the path you set
        if (meta.activeMenu) {
          return meta.activeMenu
        }
        return path
      },
      showLogo() {
        return this.$store.state.settings.sidebarLogo
      },
      variables() {
        return variables
      },
      isCollapse() {
        return !this.sidebar.opened
      }
    },
    mounted() {
      // this.parseRouteData()
    },
    methods: {
      parseRouteData() {
        console.log(this.userInfo)
        const resourceData = JSON.parse(this.userInfo.resourceCode)
        let routeData = this.permission_routes[0].children
        let result = []
        const checkAcitve = (child, parentIndex) => {
          
          if (child.children && child.children.length > 0) {
            let data = child
            child.children.forEach((item, index) => {
              data.children = []
              data.children.push(checkAcitve(item, index))
            })
            return Object.assign(data, {
              children: data.children
            })
          } else {
            let result
            if ((!resourceData.find(item => item === child.name))) {
              result = Object.assign(child, {
                hidden: true
              })
            } else if (child.hidden === true) {
              result = Object.assign(child, {
                hidden: true
              })
            } else {
              result = Object.assign(child, {
                hidden: false
              })
            }
            return result
          }

        }
        routeData.forEach((item, index) => {
          result.push(checkAcitve(item, index))
        })

        const mainRoutes = store.state.permission.routes
        result = result.concat(mainRoutes)
        router.addRoutes(result) // 动态添加可访问路由表
      }
    }
  }

</script>
