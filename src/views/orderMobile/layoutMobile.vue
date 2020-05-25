<template>
  <div class="order_qrcode_wrapper">
    <p class="hint">支付完成</p>
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',

  data() {
    return {
      findOrderByOrderNoRequest: 'order/findOrderByOrderNo',
    }
  },
  computed: {
    tableHeight() {
      return 'calc(100vh - 320px)'
    },


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

