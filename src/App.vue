<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  created() {
    document.querySelector('.loading_container').style.display = 'none'
    this.getCurrentRoute()
  },
  methods: {
    getCurrentRoute() {
      this.$store.commit('app/updateCurrentRouteData', this.$route)
    }
  }
}
</script>

<style lang="scss">
</style>


<style lang="css">
@import "./font/iconfont/iconfont.css";
</style>

