<template>
  <div class="innerlayout">
    <!-- {{this.$route.meta.functionaility}} -->
    <router-view />

  </div>
</template>

<script>
export default {
  name: "InnerLayout",
  data() {
    return {
      getUserInfoRequest: '/getUserInfo'
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  watch: {

  },
  created() {
    this.getUserInfo()
    console.log('created() {', this.$route)
    // this.$store.dispatch('getUserInfo')
    document.getElementsByTagName('html')[0].style.fontSize = ''

  },
  mounted() {
  },
  methods: {
    getUserInfo() {
      if (this.userInfo === {}) {
        return
      }
      console.log(this.userInfo)
      this.$http.post(this.getUserInfoRequest, {}).then(response => {
        console.log('getUsercInfo+++', response)
        this.$store.commit('setUserInfo', response.data)
        sessionStorage.setItem('userInfo', JSON.stringify(response.data))

      }).catch(error => {
        console.log('用户信息获取失败')

        // this.$store.commit('setUserInfo', JSON.parse(sessionStorage.getItem('userInfo')))

      })
    },

  }
};

</script>


