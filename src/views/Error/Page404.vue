<template>
  <div class="access_404_container">
    <div class="main">
      <img src="@/image/access/404.png" alt="">
      <div class="desc">
        <h1>404</h1>
        <p>抱歉，你访问的页面不存在</p>
        <div>
          <el-button type='primary' size='small' @click='backToHome'> 返回首页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: '404',
    computed: {
      message() {
        return 'The webmaster said that you can not enter this page...'
      }
    },
    methods: {
      backToPrev() {
        this.$router.back(-1)
      },
      backToHome() {
        this.$router.push({
          name: 'dashboard'
        })
      },
    }
  }

</script>


