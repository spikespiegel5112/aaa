<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="advanceQueryParams" label-width="80px">
          <el-row>
            <el-col :span='5'></el-col>
          </el-row>
        </el-form>
      </template>
      <template v-slot:operation>
        <ul>
          <li v-if="$checkAuthority($route, 'save')">
            <el-button class="blue" type="primary" @click='handleCreate'>添加</el-button>
          </li>
          <li v-if="$checkAuthority($route, 'delete')">
            <el-button type="danger" @click='handleMultipleDelete'>删除</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>
    <el-table :data="tableData" :height='tableHeight' v-loading="tableLoading" @sort-change='handleSort'
      @select='handleSelect' @selection-change='handleSelectionChange' @select-all='handleSelectAll'>
      <el-table-column type="selection" width="55"> </el-table-column>
      <!-- <el-table-column prop="code" label="代码"> </el-table-column> -->
      <!-- 布尔类型 -->
      <!-- <el-table-column prop="accessApplication" label="银联全渠道商户入网申请表"> </el-table-column> -->
      <!-- <el-table-column prop="paymentServiceAgreement" label="银联特约商户支付服务协议"> </el-table-column> -->
      <!-- <el-table-column prop="paymentServiceApplication" label="银联特约商户支付业务申请书"> </el-table-column> -->
      <!-- <el-table-column prop="crossuseApplication" label="银联跨地区使用申请表"> </el-table-column> -->
      <!-- <el-table-column prop="cooperationAgreement" label="厚车吉市商户合作协议"> </el-table-column> -->
      <!-- 图片类型 -->
      <!-- <el-table-column prop="busnessLicense" label="营业执照复印件"> </el-table-column> -->
      <!-- <el-table-column prop="legalIdCard" label="法人身份证复印件"> </el-table-column> -->
      <!-- <el-table-column prop="headDoorLicence" label="开户许可证复印件"> </el-table-column> -->
      <!-- <el-table-column prop="locationScreenshots" label="门头门牌照"> </el-table-column> -->
      <!-- <el-table-column prop="name" label="地图位置截图"> </el-table-column> -->
      <!-- 字符串类型 -->
      <el-table-column prop="name" label="企业简称"> </el-table-column>
      <el-table-column prop="companyName" label="企业名称"> </el-table-column>
      <el-table-column prop="legalName" label="法人代表姓名"> </el-table-column>
      <el-table-column prop="address" label="经营地址"> </el-table-column>
      <el-table-column prop="companyPhone" label="公司联系电话"> </el-table-column>
      <el-table-column prop="contacts" label="联系人"> </el-table-column>
      <el-table-column prop="contactsPhone" label="联系人电话"> </el-table-column>
      <el-table-column prop="email" label="邮箱"> </el-table-column>
      <!-- <el-table-column prop="bankAccountName" label="企业收款账户信息（户名，账号，开户行）"> </el-table-column> -->
      <!-- <el-table-column prop="bankAccountNum" label="企业支付宝账号"> </el-table-column> -->
      <el-table-column prop="bankOpen" label="开户行"> </el-table-column>

      <el-table-column prop="status" label="状态" width="150">
        <template slot-scope="scope">
          <el-switch v-if="$checkAuthority($route, 'setup')" v-model="scope.row.status" active-color="#13ce66"
            inactive-color="#ccc" active-text="启用" inactive-text="冻结" @change='handleChangeMerchantStatus(scope)'>
          </el-switch>
          <div v-else>
            <el-tag v-if='scope.row.isDiscount===0' size="small" type="danger">否</el-tag>
            <el-tag v-else size="small" type="success">是</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="$checkAuthority($route, 'setup')" type='primary' @click='setupProduct(scope)'>产品配置
          </el-button>
          <el-button v-if="$checkAuthority($route, 'save')" type='primary' @click='handleEdit(scope)'>编辑</el-button>
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

    <!-- 产品配置 -->
    <el-dialog title="产品配置" :visible.sync="dialogVisibleDistribution" width="730px"
      :before-close="handleCloseDialogSetupProduct" :close-on-click-modal='false'
      @close='handleCloseDialogSetupProduct'>
      <div class="common_transfer_wrapper">
        <el-transfer v-model="chosenProductData" :data="productData" :titles="['可分配产品', '已分配产品']"></el-transfer>
      </div>

      <span slot="footer">
        <el-button @click="dialogVisibleDistribution = false">取 消</el-button>
        <el-button v-if="$checkAuthority($route, 'save')" type="primary" @click="handleSubmitTransfer">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑商户 -->
    <el-dialog class="common_fullscreen_container" title="编辑商户" :visible.sync="dialogVisibleEditMerchant"
      :before-close="handleCloseDialogEditMerchant" :modal='false' :close-on-click-modal='false'
      @close='handleCloseDialogEditMerchant' top='0' :append-to-body='false'>
      <template slot="title"></template>
      <EditMerchant v-if='dialogVisibleEditMerchant' :merchantId='currentMerchantId'
        @close='handleCloseDialogEditMerchant' />
    </el-dialog>

  </div>
</template>

<script>
import EditMerchant from './editMerchant'

export default {
  name: 'MerchantManagement',
  components: {
    EditMerchant
  },
  data() {
    return {
      findMerchantListRequest: '/merchant/findMerchantList',
      findTradeListRequest: '/trade/findTradeList',

      saveMerchantRequest: '/merchant/saveMerchant',
      updateMerchantRequest: '/merchant/updateMerchant',

      deleteMerchantRequest: '/merchant/deleteMerchant',




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
        name: '',
      },
      pagination: {
        page: 1,
        size: 10,
        limit: 0
      },
      currentMerchantId: '',
      sortParams: '',
      roleQueryLoading: false,
      dialogVisibleDistribution: false,
      dialogVisibleEditMerchant: false,
      dialogVisible: false,
      dialogType: 0,

      currentTradeData: {},
      chosenProductData: [],
      selectionData: [],
      tableLoading: true,
      tableData: [],
      originalProductData: [],
      productData: [],
      roleQueryListData: [],


      fileList: []
    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {

      return 'calc(100vh - 320px)'
    },
    dialogStyle() {
      return {
        height: 'calc(100vh - 250px)',
        overflow: 'auto'
      }
    },

  },
  created() {
    
    console.log("this.$checkAuthority(this.$route, 'list')++++", this.$checkAuthority(this.$route, 'list'))
    if(this.$checkAuthority(this.$route, 'list')){
      
    }
    this.$checkAuthority(this.$route, 'list') ? this.getTableData() : this.tableLoading = false
    this.getProductData()
  },
  mounted() {
  },
  methods: {
    getTableData() {
      this.tableLoading = true
      let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
      this.$http.post(this.findMerchantListRequest, {
        pageNum: this.pagination.page,
        pageSize: this.pagination.size
      }).then(async response => {
        let responseData = response.data
        this.tableLoading = false
        responseData.map(item => {
          return Object.assign(item, {
            status: item.status === 1 ? true : false
          })
        })
        console.log('tableData+++++', responseData)
        this.tableData = responseData
        this.pagination.limit = response.total


      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },

    getProductData() {
      this.tableLoading = true
      this.$http.post(this.findTradeListRequest, {
        pageNum: this.pagination.page,
        pageSize: this.pagination.size
      }).then(async response => {
        const responseData = response.data
        const result = []
        this.originalProductData = responseData
        responseData.forEach((item, index) => {
          result.push({
            key: item.id,
            label: item.name,
            disabled: false
          })
        })
        this.productData = result
        console.log('getProductData+++++', this.productData)
      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },
    setupProduct(scope) {
      this.currentTradeData = {
        id: scope.row.id,
        trades: scope.row.trades
      }
      this.dialogVisibleDistribution = true
      this.chosenProductData = this.currentTradeData.trades.map(item => item.id)

      console.log('setupProduct++++++', this.currentTradeData)
      console.log('setupProduct++++++', this.tableData)
    },
    async handleSubmitTransfer() {
      let tradeData = this.originalProductData.filter(item1 => {
        return this.chosenProductData.filter(item2 => item2 === item1.id).length > 0
      })
      console.log(this.tableData)
      console.log(tradeData)
      const submitData = {
        id: this.currentTradeData.id,
        trades: tradeData
      }
      await this.updateMerchantPromise(submitData)
      this.getTableData()
      this.dialogVisibleDistribution = false
    },
    handleChangeMerchantStatus(scope) {
      this.$confirm('确认是否更改此商户状态？', '提示').then(() => {
        const submitData = {
          id: scope.row.id,
          status: scope.row.status ? 1 : 0
        }
        this.updateMerchantPromise(submitData)

      }).catch(error => {
        scope.row.status = !scope.row.status

      })

    },
    updateMerchantPromise(submitData) {
      return new Promise((resolve, reject) => {
        this.$http.post(this.updateMerchantRequest, submitData).then(response => {
          this.$message.success('操作成功')
          resolve(response)
        }).catch(error => {
          console.log(error)
          reject(error)
          scope.row.status = !scope.row.status
        })
      })
    },
    handleSubmit(submitData) {
      console.log('this.tableData++++', this.tableData)
      if (!submitData) {
        submitData = this.tableData.map(item => {
          return Object.assign(item, {
            status: item.status ? 1 : 0
          })
        })
      }

      console.log("submitData+++++", submitData)
      this.$http.post(this.saveMerchantRequest, submitData).then(response => {
        this.$message.success('保存成功')
        this.getTableData()

        this.dialogVisibleDistribution = false
      }).catch(error => {
        this.$message.error(error)
        this.getTableData()

      })
    },

    transformToOriginalData(tableData) {
      const submitData = tableData.map((item, index) => {
        let result = {}
        Object.keys(item).forEach((item2, index2) => {
          if (item[item2].editing !== undefined) {
            result[item2] = item[item2].value
          } else {
            result[item2] = item[item2]
            result.status = this.$booleanToNumber(item.status, 1, 0)
          }
        })
        return result
      })
      return submitData

    },
    handleMultipleDelete() {
      console.log(this.selectionData)
      if (this.selectionData.length === 0) {
        this.$message.error('请选择一条数据')
        return
      }

      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let submitData = this.selectionData.map(item => {
          return {
            id: item.id
          }
        })

        console.log(submitData)

        this.$http.post(this.deleteMerchantRequest, submitData).then(response => {
          this.$message.success('删除成功')
          this.getTableData()
        }).catch(error => { })
      }).catch(error => {
        console.log(error)
      })

    },

    handleSelect(selectionList, selection) {
      this.selectionData = selectionList
    },
    handleSelectAll(selectionList) {
      this.selectionData = selectionList
    },
    handleSelectionChange(selection) {

    },
    handleConfirmValue(scope) {
      this.tableData[scope.$index][scope.column.property].editing = false
    },
    handleCancelValue(scope) {
      this.tableData[scope.$index][scope.column.property].value = this.tempValue
      this.tableData[scope.$index][scope.column.property].editing = false
    },
    query() {
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
    async handleCreate() {
      this.dialogVisibleEditMerchant = true
      this.currentMerchantId = ''
    },
    async handleEdit(scope) {
      console.log(scope)

      this.$store.commit('app/setCurrentMerchantData', scope.row)
      this.dialogVisibleEditMerchant = true
      await this.$nextTick()

      this.currentMerchantId = scope.row.id
    },
    async handleCloseDialogSetupProduct() {
      this.dialogVisibleDistribution = false
    },
    handleCloseDialogEditMerchant(status) {
      this.dialogVisibleEditMerchant = false
      this.$store.commit('app/setCurrentMerchantData', [])
    },
    handleSort() { },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);

    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    }

  }
}

</script>


