<template>
  <div class="common_table_container">
    <el-row class="order_createorder_wrapper">
      <div class="common_step_wrapper">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="新增收款"></el-step>
          <el-step title="生成二维码"></el-step>
          <el-step title="支付完成 "></el-step>
        </el-steps>
      </div>
      <div class="step_wrapper step1" v-if='currentStep===0'>
        <div class="common_form_container">
          <el-form ref="formData" :model="formData" label-width="100px" :rules='rules'>
            <el-form-item label="金额" prop='amount'>
              <el-input v-model="formData.amount"></el-input>
            </el-form-item>
            <el-form-item label="支付方式" prop='paymentId'>
              <el-radio v-for='item in tradeDictionary' :key="item.id" v-model="formData.paymentId" :label="item.id"
                @change='handleChangePaymentName(item)'>{{item.name}}</el-radio>
            </el-form-item>
            <el-form-item label="贴息" prop='isDiscount'>
              <el-radio-group v-model="formData.isDiscount" :disabled='!hasDiscount'>
                <el-radio :label="0">否</el-radio>
                <el-radio v-if='hasDiscount' :label="1">是</el-radio>
              </el-radio-group>

            </el-form-item>

            <el-form-item label="分期" prop='period' v-if='checkPeriodVisible'>
              <div v-if='formData.isDiscount===0'>
                <el-radio v-for='item in currentPeriodData.period' :key='item.index' v-model="formData.period"
                  :label="item">{{item}}期</el-radio>
              </div>
              <div v-else>
                <el-radio v-for='item in currentPeriodData.periodDiscount' :key='item.index' v-model="formData.period"
                  :label="item">{{item}}期</el-radio>
              </div>

            </el-form-item>
            <el-form-item label="备注" prop='remark'>
              <el-input v-model="formData.remark" type='textarea'></el-input>
            </el-form-item>
            <el-form-item>
              <el-button v-if="$checkAuthority($route, 'create')" type="primary" @click="handleSubmit">立即创建</el-button>
              <el-button @click='reset'>重置</el-button>
            </el-form-item>
          </el-form>
        </div>

      </div>
      <div class="step_wrapper step2" v-if='currentStep===1'>
        <div class="order_qrcode_wrapper">
          <p class="hint">恭喜，二维码创建成功</p>
          <div class="qrcode">
            <canvas id="canvas"></canvas>
          </div>
          <div v-if='failedFlag' class="error">当前二维码已超时，请重新创建订单</div>
        </div>
      </div>
      <div class="step_wrapper step3" v-if='currentStep===2'>
        <div class="order_qrcode_wrapper">
          <p class="hint">支付完成</p>
        </div>
      </div>
    </el-row>

  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'CreateOrder',

  data() {
    var checkNumber = (rule, value, callback) => {
      var reg = /[^0-9.]/g
      console.log(reg.test(value))
      if (reg.test(value)) {
        return callback(new Error('请输入整数或小数'));
      } else {
        return callback()
      }
    };
    return {
      currentStep: 0,

      // step1
      findMerchantPeriodRequest: '/trade/findMerchantPeriod',
      findMerchantDetailRequest: '/merchant/findMerchantDetail',
      saveOrderRequest: '/order/saveOrder',
      getOrderPaymentRequest: '/payment/orderPayment',

      pagination: {
        page: 1,
        size: 10,
        limit: 0
      },
      sortParams: '',
      roleQueryLoading: false,
      dialogVisible: false,
      dialogType: 0,
      formData: {
        amount: "",
        isDiscount: '',
        paymentId: '',
        paymentName: '',
        period: "",
        remark: ""
      },
      selectionData: [],
      rules: {
        amount: [{
          required: true,
          message: '请输入金额',
          trigger: 'change'
        }, {
          validator: checkNumber,
          message: /[^0-9.]/g,
          trigger: 'blur'
          // }, {
          //   pattern: /[^0-9.]/g,
          //   message: '目前只支持中国大陆的手机号码'
        }],
        isDiscount: [{
          required: true,
          message: '请选择是否贴息',
          trigger: 'change'
        }],
        paymentId: [{
          required: true,
          message: '请选择支付方式',
          trigger: 'change'
        }],
        period: [{
          required: true,
          message: '请选择分期',
          trigger: 'change'
        }],
        remark: [{
          required: false,
          message: '请输入备注',
          trigger: 'change'
        }]
      },
      tableLoading: true,
      tableData: [],
      paymentData: [],
      // periodData: {
      //   id: '',
      //   period: [],
      //   periodDiscount: []
      // },
      orderNo: '',
      tradeDictionary: [],
      periodData: {},
      tradeIndex: 0,
      currentPeriodData: {},

      // step2
      findOrderByOrderNoRequest: '/order/findOrderByOrderNo',
      alipayNotifyRequest: '/notify/alipayNotify',
      timesLimit: 0,
      qrCodeData: '',
      failedFlag: false,
      timer: '',
      qrCode: '',


    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    userInfo() {
      return this.$store.state.user.userInfo
    },
    pollingCheckOrderStatusTimesLimit() {
      return this.$store.state.app.pollingCheckOrderStatusTimesLimit
    },

    hasDiscount() {
      let result = false
      const periodDiscount = this.currentPeriodData.periodDiscount
      // debugger
      if (periodDiscount instanceof Array && periodDiscount.length > 0) {
        result = true
      }
      return result

    },
    checkPeriodVisible() {
      let result = true
      // let currentPeriodData = this.currentPeriodData
      if (Object.keys(this.currentPeriodData).length === 0 || !this.currentPeriodData.periodDiscount) {
        return false
      }
      if (this.currentPeriodData.isDiscount === 0) {
        console.log('this.currentPeriodData.isDiscount === 0+++', result)
        if (this.currentPeriodData.period.length === 0 || (this.currentPeriodData.period.length === 1 && this.currentPeriodData.period[0] === '0')) {
          result = false
        } else {
          result = true
        }
      } else {
        console.log('this.currentPeriodData.isDiscount !== 0+++', result)
        if (this.currentPeriodData.periodDiscount.length === 0 || (this.currentPeriodData.periodDiscount.length === 1 && this.currentPeriodData.periodDiscount[0] === '0')) {
          result = false
        } else {
          result = true
        }
      }
      console.log('this.currentPeriodData', this.currentPeriodData)

      return result
    }

  },
  created() {
    this.getPeriodData()
  },
  mounted() {

  },
  beforeDestroy() {
    this.timer = null;
  },
  methods: {
    getPeriodData() {
      console.log(this.userInfo)
      this.$http.post(this.findMerchantDetailRequest, {
        id: this.userInfo.merchant.id
      }).then(async response => {
        console.log('response+++++', response)

        let responseData = response.data
        this.paymentData = responseData.trades.filter(item => item.status !== 0)
        this.tradeDictionary = responseData.trades.filter(item => item.status !== 0).map(item => {
          return Object.assign(item, {
            period: item.period.split(',').sort((a, b) => a - b)
          })
        })
        console.log('this.tradeDictionary++++++', this.tradeDictionary)
      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },

    handleSubmit() {

      this.$refs.formData.validate(async valid => {


        if (valid) {
          this.handleSubmitPromise().then(response => {
            this.currentStep = 1
            this.$message.success('获取二维码成功')

            setTimeout(async () => {
              await this.$nextTick()
              this.timesLimit = this.pollingCheckOrderStatusTimesLimit
              await this.getQRCodePromise()
              await this.showQRCode()
            }, 500)
          }).catch(error => {
            this.$message.error(error)

          })


        }
      })
    },
    handleSubmitPromise() {

      return new Promise((resolve, reject) => {
        this.$http.post(this.saveOrderRequest, Object.assign(this.formData, {
          amount: Number(this.formData.amount),
          paymentId: this.formData.paymentId,
          paymentName: this.tradeDictionary.find(item => item.id === this.formData.paymentId).name,
          period: this.formData.period === '' ? 0 : this.formData.period
        })).then(response => {
          this.orderNo = response.data.orderNo
          localStorage.setItem('orderNo', this.orderNo)
          resolve(response)
        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })


    },
    getQRCodePromise() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.getOrderPaymentRequest, {
          orderNo: this.orderNo
        }).then(response => {
          this.qrCode = response.data

          this.$store.commit('app/setQrCode', this.qrCode)
          localStorage.setItem('qrCodeData', response.data)
          resolve(response.data)
        }).catch(error => {
          console.log(error)
          this.$message.error(error)
          reject(error)
        })
      })
    },

    async handleChangePaymentName(data) {
      console.log('handleChangePaymentName+++++', data)
      console.log('this.tradeDictionary+++++', this.tradeDictionary)
      this.formData.isDiscount = 0
      let currentPeriodData = this.tradeDictionary.find(item => item.id === data.id)
      const checkTradeIndex = id => {
        this.tradeDictionary.forEach((item, index) => {
          if (item.id === id) {
            this.tradeIndex = index
          }
        })
      }

      if (currentPeriodData.hasDiscountData) {
        this.currentPeriodData = currentPeriodData
      } else {
        const paymentData = await this.getPaymentDataPromise(data)
        let periodDiscountResult = []
        if (paymentData.data) {
          let responseData = paymentData.data
          checkTradeIndex(data.id)
          this.currentPeriodData = this.tradeDictionary[this.tradeIndex]

          periodDiscountResult = responseData.period && this.currentPeriodData.isDiscount !== 0 ? responseData.period.split(',').sort((a, b) => a - b) : []


          periodDiscountResult = this.currentPeriodData.period.filter(item => {
            return periodDiscountResult.find(item2 => item2 === item)
          })


          console.log('this.periodData++++', this.tradeDictionary[this.tradeIndex].periodDiscount)
          console.log('this.currentPeriodData++++', this.currentPeriodData)
        } else {
          checkTradeIndex(data.id)
          this.currentPeriodData = this.tradeDictionary[this.tradeIndex]


          this.formData = Object.assign(this.formData, {
            period: ''
          })
        }
        this.tradeDictionary[this.tradeIndex].periodDiscount = periodDiscountResult
        this.tradeDictionary[this.tradeIndex].hasDiscountData = true




      }

    },
    getPaymentDataPromise(data) {
      return new Promise((resolve, reject) => {
        this.$http.post(this.findMerchantPeriodRequest, {
          merchantId: this.userInfo.merchant.id,
          tradeId: data.id
        }).then(response => {
          console.log('findMerchantPeriodRequest++++', response)

          resolve(response)
        }).catch(error => {
          console.log(error)
          reject(error)

        })
      })
    },
    reset() {
      this.$refs.formData.resetFields()
    },


    // step2
    showQRCode() {


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
            this.currentStep = 2
            this.timer = null
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

