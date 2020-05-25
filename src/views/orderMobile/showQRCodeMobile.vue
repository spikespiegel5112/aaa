<template>
  <div>
    <div class="common_vantstep_wrapper">
      <van-steps :active="active" active-color="#dd7034">
        <van-step class="step1">正在支付</van-step>
        <van-step class="step2">支付完成</van-step>
      </van-steps>
    </div>

    <div class="order_qrcodemobile_wrapper">
      <p class="hint">打开{{paymentName}}，扫一扫</p>
      <!-- {{timestamp}}
      {{currentTimestamp}}
      {{(currentTimestamp-timestamp)/1000}}
      {{timeLimit}} -->
      <div class="qrcode_wrapper">
        <div class="qrcode" ref='qrcode'></div>
        <div class="amount">金额：{{amount}}</div>
        <div v-if='failedFlag'>
          <div class="error">当前二维码已超时</div>
          <div>
            <van-button plain @click='goBack'>返回</van-button>
          </div>
        </div>

      </div>
    </div>

  </div>

</template>

<script>
import { Notify } from 'vant';

// import QRCode from 'qrcode'
import QRCode2 from 'qrcodejs2'
export default {
  name: 'ShowQRCode',

  data() {
    return {
      findOrderByOrderNoRequest: '/order/findOrderByOrderNo',
      alipayNotifyRequest: '/notify/alipayNotify',
      timeLimit: 1800, // 以秒为单位
      frequencey: 3, // 以秒为单位
      qrCodeData: '',
      failedFlag: false,
      active: 0,
      timer: '',
      timestamp: 0,
      currentTimestamp: 0,
      amount: ''
    }
  },
  computed: {
    paymentName() {
      return this.$route.query.paymentName
    }
  },
  created() {

  },
  mounted() {
    this.showQRCode()
    this.getAmount()

  },
  beforeDestroy() {
    this.timer = null
  },
  methods: {
    getAmount() {
      this.amount = sessionStorage.getItem('amount')
    },
    checkIfexpired() {
      this.currentTimestamp = Math.round(new Date())
      const storeData = this.$store.state.app.timestamp
      this.timestamp = storeData === '' ? sessionStorage.getItem('timestamp') : storeData
      if (!this.timestamp) {
        this.failedFlag = true
      }
      return (this.currentTimestamp - this.timestamp) / 1000 >= this.timeLimit
    },
    showQRCode() {
      if (this.$store.state.app.qrCodeData !== '') {
        this.qrCodeData = this.$store.state.app.qrCodeData
      } else {
        this.qrCodeData = sessionStorage.getItem('qrCodeData')
      }
      // QRCode.toCanvas(canvas, this.qrCodeData, function (error) {
      //   if (error) console.error(error)
      //   console.log('success!');
      // })

      new QRCode2(this.$refs.qrcode, {
        text: this.qrCodeData,
        width: 600,
        height: 600,
        colorDark: "#000000",
        colorLight: "#ffffff",
        // correctLevel: QRCode.CorrectLevel.H
      });
      this.getPaymentStatusTimer()
    },
    notifyAlipay() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.alipayNotifyRequest, {}).then(response => {
          resolve(true)
        })
      })

    },
    getPaymentStatusTimer() {
      this.timer = () => {
        setTimeout(() => {
          // this.timeLimit--
          this.currentTimestamp = Math.round(new Date())
          this.getPaymentStatusPromise().then(() => {
            if (!this.failedFlag) {
              this.$router.push({
                name: 'congratulationMobile'
              })
            } else {
              Notify({
                type: 'error',
                message: '当前二维码已超时，请重新创建订单',
                duration: 1000,
              });
            }
          }).catch(error => {
            console.log(error)
            if (!!this.timer) {
              this.timer()
            }
          })
        }, this.frequencey * 1000)
      }
      if (this.checkIfexpired()) {

        this.failedFlag = true
        this.timer = null
      } else {


        this.timer()
      }
    },

    getPaymentStatusPromise() {
      const orderNo = sessionStorage.getItem('orderNo')
      return new Promise((resolve, reject) => {
        this.$http.post(this.findOrderByOrderNoRequest, {
          orderNo: orderNo
        }).then(response => {
          response = response.data

          this.amount = response.amount
          if (this.checkIfexpired()) {
            this.failedFlag = true
            this.timer = null
            resolve(this.failedFlag)
          }
          if (response.status !== 2) {
            reject(this.failedFlag)

          } else {
            this.timer = null
            resolve(this.failedFlag)

          }
        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })

    },
    onClickRight() {

    },
    goBack() {
      this.$router.go(-1)

    }

  }
}

</script>
<style scoped lang='scss'>
@import "../../sassmobile/ordermobile.scss";
</style>
