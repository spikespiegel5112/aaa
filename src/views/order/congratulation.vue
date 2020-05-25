<template>
  <div class="order_qrcode_wrapper">
    <div class="common_step_wrapper">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="新增收款"></el-step>
        <el-step title="生成二维码"></el-step>
        <el-step title="支付完成 "></el-step>
      </el-steps>
    </div>
    <p class="hint">支付完成</p>

  </div>
</template>

<script>
export default {
  name: 'CreateOrder',
  
  data() {
    return {
      currentStep: 3
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

