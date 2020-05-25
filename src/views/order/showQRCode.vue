<template>
  <div class="order_qrcode_wrapper">
    <div class="common_step_wrapper">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="新增收款"></el-step>
        <el-step title="生成二维码"></el-step>
        <el-step title="支付完成 "></el-step>
      </el-steps>
    </div>
    <p class="hint">恭喜，二维码创建成功</p>
    <div class="qrcode">
      <canvas id="canvas"></canvas>
    </div>
    <div v-if='failedFlag' class="error">当前二维码已超时，请重新创建订单</div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
export default {
  name: 'ShowQRCode',

  data() {
    return {
      findOrderByOrderNoRequest: '/order/findOrderByOrderNo',
      alipayNotifyRequest: '/notify/alipayNotify',
      timesLimit: 0,
      qrCodeData: '',
      failedFlag: false,
      currentStep: 1,
      timer: ''
    }
  },
  computed: {
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    pollingCheckOrderStatusTimesLimit() {
      return this.$store.state.app.pollingCheckOrderStatusTimesLimit
    }
  },
  beforeCreate() {

  },
  created() {
    this.getQrCode()
    this.timesLimit = this.pollingCheckOrderStatusTimesLimit
  },
  mounted() {


  },
  methods: {
    getQrCode() {


      if (this.$store.state.app.qrCodeData !== '') {
        this.qrCodeData = this.$store.state.app.qrCodeData
      } else {
        this.qrCodeData = localStorage.getItem('qrCodeData')
      }
      QRCode.toCanvas(canvas, this.qrCodeData, function (error) {
        if (error) console.error(error)
        console.log('success!');
      })
      this.getPaymentStatus()
    },
    notifyAlipay() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.alipayNotifyRequest, {}).then(response => {
          resolve(true)
        })
      })
    },
    getPaymentStatus() {

      this.timer = () => {
        setTimeout(() => {
          this.timesLimit--
          this.getPaymentStatusPromise().then(() => {
            // this.getPaymentStatus()
            this.timer = null
          }).catch(error => {
            if (!!this.timer) {
              this.timer()
            }
          })
        }, 3000)
      }
      this.timer()
      this.$once('hook:beforeDestroy', () => {
        debugger
        this.timer = () => { }
      })
    },
    getPaymentStatusPromise() {
      const orderNo = localStorage.getItem('orderNo')
      return new Promise((resolve, reject) => {
        this.$http.post(this.findOrderByOrderNoRequest, {
          orderNo: orderNo
        }).then(response => {
          response = response.data
          if (this.timesLimit === 0) {
            this.failedFlag = true
            this.$message.error('当前二维码已超时，请重新创建订单')
            resolve()

          }
          if (response.status !== 2) {
            reject()

          } else {
            this.$router.push({
              name: 'congratulation'
            })
            resolve()

          }
        }).catch(error => {
          reject(error)
        })
      })

    }


  }
}

</script>

