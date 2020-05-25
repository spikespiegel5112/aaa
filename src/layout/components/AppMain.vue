<template>
  <section class="app_main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <el-card class="box_card">
          <router-view :key="key" />
        </el-card>
      </keep-alive>
    </transition>
    <!-- <el-card class="box_card">
      <router-view :key="key" />
    </el-card> -->
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}

</script>

<style lang="scss" scoped>
/* .app_main {
    padding: 0 25px 25px 25px;
    min-height: calc(100vh - 155px);
    width: 100%;
    position: relative;
    overflow: hidden;
  } */

.fixed-header + .app_main {
  padding-top: 50px;
}

.hasTagsView {
  .app_main {
    /* 84 = navbar + TagsView = 50 + 34 */
    min-height: calc(100vh - 84px);
    background-color: #f0f2f5;
  }

  .fixed-header + .app_main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
