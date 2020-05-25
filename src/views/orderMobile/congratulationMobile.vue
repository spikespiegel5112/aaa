<template>
  <div class="step3">
    <div class="common_vantstep_wrapper">
      <van-steps :active="active" active-color="#dd7034">
        <van-step class="step1">正在支付</van-step>
        <van-step class="step2">支付完成</van-step>
      </van-steps>
    </div>
    <div class="banner">
      <img src="@/image/mobile/success.png" alt="">
      <label for="">支付成功</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',

  data() {
    return {
      active: 1,

    }
  },
  computed: {
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    qrCode() {
      return this.$store.state.app.qrCode
    }
  },
  beforeCreate() {

  },
  created() {
  },
  mounted() {
  },
  methods: {



  }
}

</script>

