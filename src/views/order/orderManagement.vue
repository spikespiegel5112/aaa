<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="queryParams" label-width="80px">
          <el-row>
            <el-col :span='6'>
              <el-form-item label="订单编号">
                <el-input v-model="advanceQueryParams.orderNo" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='6'>
              <el-form-item label="起止时间">
                <el-date-picker v-model="advanceQueryParams.orderDate" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" clearable></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span='6'>
              <el-form-item label="订单状态">
                <el-select v-model="advanceQueryParams.status" placeholder="请选择" clearable>
                  <el-option v-for='item in orderStatusDictionary' :key='item.value' :label="item.title"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template v-slot:operation>
        <ul>
          <li v-if="$checkAuthority($route, 'list')">
            <el-button class="blue" type="primary" @click='query'>查询</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>
    <el-table :data="tableData" :height='tableHeight' v-loading="tableLoading" @sort-change='handleSort'
      @select='handleSelect' @selection-change='handleSelectionChange' @select-all='handleSelectAll'>
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="orderNo" label="订单号" width="140"></el-table-column>
      <el-table-column prop="paymentName" label="支付方式" width="100">
        <!-- <template slot-scope="scope">
          {{scope.row.merchant.code}}
        </template> -->
      </el-table-column>
      <el-table-column prop="merchant" label="商户名称">
        <template slot-scope="scope">
          {{scope.row.merchant.name}}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="交易金额">
        <template slot-scope='scope'>
          {{formatMoney(scope.row.amount)}}
        </template>
      </el-table-column>
      <el-table-column prop="isDiscount" label="贴息" width="60px">
        <template slot-scope="scope">
          <el-tag v-if='scope.row.isDiscount===0' size="small" type="danger">否</el-tag>
          <el-tag v-else size="small" type="success">是</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="period" label="分期">
        <template slot-scope="scope">
          {{scope.row.period}}期
        </template>
      </el-table-column>
      <el-table-column prop="status" label="支付状态">
        <template slot-scope="scope">
          {{orderStatusDictionary.find(item=>item.value===scope.row.status).title}}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="180px"> </el-table-column>
      <el-table-column prop="preserveDate" label="下单时间" width="170px">
        <template slot-scope="scope">
          {{scope.row.preserveDate?$moment(scope.row.preserveDate).format('YYYY-MM-DD HH:mm:ss'):''}}
        </template>
      </el-table-column>
      <el-table-column prop="transactionDate" label="核销时间" width="170px">
        <template slot-scope="scope">
          {{scope.row.transactionDate?$moment(scope.row.transactionDate).format('YYYY-MM-DD HH:mm:ss'):''}}
        </template>
      </el-table-column>
      <el-table-column prop="user" label="操作人" width="100">
        <template slot-scope="scope">
          {{scope.row.user.name}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template slot-scope="scope">
          <div v-if='orderStatusDictionary.find(item=>item.value===scope.row.status).value===1'>
            <el-tooltip v-if="$checkAuthority($route, 'qrcode')" content="查看二维码" effect="dark" placement="bottom">
              <el-button class="iconfont icon-qrcode" @click='checkOrder(scope)'> </el-button>
            </el-tooltip>
            <el-button v-if="$checkAuthority($route, 'refresh')" type='primary' @click='checkOrderQuery(scope)'>订单状态
            </el-button>
          </div>
        </template>
      </el-table-column>

    </el-table>
    <div class="common_pagination_comtainer">
      <div class="total">总共{{pagination.limit}}条</div>
      <div class="main">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pagination.page" :prev-click='handlePrevPage' :next-click='handleNextPage'
          :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size" layout="sizes, prev, pager, next, jumper"
          :total="pagination.limit">
        </el-pagination>
      </div>

    </div>

    <!-- 查看二维码 -->
    <el-dialog title="查看二维码" :visible.sync="dialogVisible" width="500px" :before-close="handleCloseDialog"
      :close-on-click-modal='false' @close='handleCloseDialog'>
      <div class="order_qrcodepopup_wrapper">
        <div v-if='currentStep===1' class="step1">
          <div class="common_step_wrapper">
            <el-steps :active="currentStep" finish-status="success" align-center>
              <el-step title="生成二维码"></el-step>
              <el-step title="支付完成 "></el-step>
            </el-steps>
          </div>
          <div class="qrcode">
            <canvas id="canvas"></canvas>
          </div>
          <div v-if='failedFlag' class="error">当前二维码已超时，请重试</div>
        </div>
        <div v-if='currentStep===2' class="step2">
          <div class="common_step_wrapper">
            <el-steps :active="currentStep" finish-status="success" align-center>
              <el-step title="生成二维码"></el-step>
              <el-step title="支付完成 "></el-step>
            </el-steps>
          </div>
          <p class="hint">支付完成</p>

        </div>

      </div>

      <span slot="footer">
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'OrderManagement',

  data() {

    return {
      findOrderListByMerchantRequest: '/order/findOrderListByMerchant',
      orderInvalidOrderRequest: '/order/invalidOrder',
      getOrderPaymentRequest: '/payment/orderPayment',
      findOrderByOrderNoRequest: '/order/findOrderByOrderNo',

      // 查看订单状态
      checkOrderQueryRequest: '/payment/orderQuery',



      queryParams: {
        isPage: 'Y',
        keyword: '',
        page: '',
        queryConditions: '',
        queryData: '',
        searchType: '',
        size: '',
        sort: '',
        specials: '',
      },
      advanceQueryParams: {
        orderNo: '',
        orderDate: null,
        status: '',
      },
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
        "id": '',
        "code": "",
        "name": "",
        status: 0,
      },
      selectionData: [],
      rules: {
        name: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'change'
        }],
        code: [{
          required: true,
          message: '请输入角色编号',
          trigger: 'change'
        }]
      },
      tableLoading: true,
      tableData: [],
      roleQueryListData: [],
      qrCodeData: '',
      currentStep: 1,
      currentOrderNo: '',
      failedFlag: false
    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    orderStatusDictionary() {
      return this.$store.state.app.orderStatusDictionary
    },
    pollingCheckOrderStatusTimesLimit() {
      return this.$store.state.app.pollingCheckOrderStatusTimesLimit
    }
  },
  created() {
    this.$checkAuthority(this.$route, 'list') ? this.getTableData() : this.tableLoading = false
    this.timesLimit = this.pollingCheckOrderStatusTimesLimit
  },
  mounted() {
  },
  methods: {
    getTableData() {
      this.tableLoading = true

      let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
      console.log(advanceQueryParams.orderDate)

      if (advanceQueryParams.orderDate !== null) {
        advanceQueryParams = Object.assign(advanceQueryParams, {
          startDate: this.$moment(advanceQueryParams.orderDate[0]).format('YYYY-MM-DD hh:mm:ss'),
          endDate: this.$moment(advanceQueryParams.orderDate[1]).format('YYYY-MM-DD hh:mm:ss')
        })
      } else {
        advanceQueryParams.startDate = ''
        advanceQueryParams.endDate = ''
      }

      this.$http.post(this.findOrderListByMerchantRequest, {
        orderNo: advanceQueryParams.orderNo,
        startDate: advanceQueryParams.startDate,
        endDate: advanceQueryParams.endDate,
        status: advanceQueryParams.status,
        pageNum: this.pagination.page,
        pageSize: this.pagination.size
      }).then(async response => {
        let responseData = response.data
        this.tableLoading = false
        console.log('tableData+++++', responseData)
        this.tableData = responseData
        this.pagination.limit = response.total


      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },

    checkOrderQuery(scope) {

      this.$http.post(this.checkOrderQueryRequest, {
        orderNo: scope.row.orderNo
      }).then(response => {
        this.getTableData()
      }).catch(error => {
        this.$message.error(error)
      })
    },

    getQRCodePromise(scope) {
      const orderNo = this.currentOrderNo
      return new Promise((resolve, reject) => {
        this.$http.post(this.getOrderPaymentRequest, {
          orderNo: orderNo
        }).then(async response => {
          this.dialogVisible = true

          this.qrCodeData = response.data
          await this.$nextTick()
          QRCode.toCanvas(canvas, response.data, function (error) {
            if (error) console.error(error)
            console.log('success!');
          })
          this.pollingGetPaymentStatus()
          resolve(response.data)
        }).catch(error => {
          console.log(error)
          this.$message.error(error)
          reject(error)
        })
      })
    },
    ininvalidOrder(scope) {
      this.$confirm('确认是否作废此订单？', '提示', {
        type: 'warning'
      }).then(() => {

        this.$http.post(this.orderInvalidOrderRequest, {
          id: scope.row.orderNo
        }).then(async response => {


        }).catch(error => {
          console.log(error)
        })
      })

    },

    handleSort(sortData) {
      console.log(sortData)
      let result = ''
      switch (sortData.order) {
        case "ascending":
          result = sortData.prop + ' ' + 'ASC'
          break;
        case "descending":
          result = sortData.prop + ' ' + 'DESC'
          break;
        default:
          result = ''
          break
      }
      this.sortParams = result
      this.getTableData()
    },
    handleSelect(selectionList, selection) {
      this.selectionData = selectionList
    },
    handleSelectAll(selectionList) {
      this.selectionData = selectionList
    },
    handleSelectionChange(selection) {

    },
    query() {
      this.pagination.page = 1
      this.getTableData()
    },
    handleSizeChange(data) {
      this.pagination.size = data
      this.getTableData()
    },
    handleCurrentChange(pageNumber) {
      this.pagination.page = pageNumber
      this.getTableData()
    },
    handlePrevPage(pageNumber) {
      this.pagination.page = pageNumber - 1
      this.getTableData()
    },
    handleNextPage(pageNumber) {
      this.pagination.page = pageNumber + 1
      this.getTableData()
    },
    handleCloseDialog() {
      this.dialogVisible = false
      this.qrCodeData = ''
      this.timer = null
      this.currentStep = 1
      this.failedFlag = false
      this.timesLimit = this.pollingCheckOrderStatusTimesLimit
      this.getTableData()
    },

    checkOrder(scope) {

      this.dialogVisible = true
      this.currentOrderNo = scope.row.orderNo
      this.getPaymentStatusPromise().then(() => {
        this.currentStep = 2
        this.timer = null
      }).catch(error => {
        this.getQRCodePromise(scope)
      })

    },
    pollingGetPaymentStatus() {
      this.timer = () => {
        setTimeout(() => {
          this.timesLimit--
          this.getPaymentStatusPromise().then(() => {
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
    getPaymentStatusPromise(scope) {
      const orderNo = this.currentOrderNo
      return new Promise((resolve, reject) => {
        this.$http.post(this.findOrderByOrderNoRequest, {
          orderNo: orderNo
        }).then(response => {
          response = response.data
          if (this.timesLimit === 0) {
            this.failedFlag = true
            this.$message.error('当前二维码已超时，请重试')
            resolve()

          }
          if (response.status !== 2) {
            reject()

          } else {
            this.currentStep = 2
            resolve()

          }
        }).catch(error => {
          reject(error)
        })
      })

    },
    formatMoney(s) {

      // n = n > 0 && n <= 20 ? n : 2;
      const n = 3

      s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";

      var l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];

      let t = "";

      for (let i = 0; i < l.length; i++) {

        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");

      }

      var mone = t.split("").reverse().join("") + "." + r;

      return t.split("").reverse().join("")

    }

  }
}

</script>


