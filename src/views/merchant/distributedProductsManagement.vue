<template>
  <div class="common_table_container">
    <TableHeader></TableHeader>
    <el-table :data="tableData" :height='tableHeight' v-loading="tableLoading" @sort-change='handleSort'
      @select='handleSelect' @selection-change='handleSelectionChange' @select-all='handleSelectAll'>
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="name" label="名称" width="200"> </el-table-column>
      <el-table-column prop="isDiscount" label="是否贴息" width="200">
        <template slot-scope="scope">
          <el-tag v-if='scope.row.isDiscount===0' size="small" type="danger">否</el-tag>
          <el-tag v-else size="small" type="success">是</el-tag>

          <!-- <el-switch v-model="scope.row.isDiscount" active-color="#13ce66" inactive-color="#ccc" active-text="是"
            inactive-text="否" disabled>
          </el-switch> -->
        </template>
      </el-table-column>
      <el-table-column prop="period" label="期数">
        <template slot-scope="scope">
          <CommonDynamicTags :tagsModel='$splitString(scope.row.period)' subfix='期' :editable='false' />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="200">
        <template slot-scope="scope">
          <!-- <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ccc" active-text="启用"
            inactive-text="冻结" disabled>
          </el-switch> -->
          <el-tag v-if='scope.row.status===0' size="small" type="danger">冻结</el-tag>
          <el-tag v-else size="small" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="$checkAuthority($route, 'tradePeriod')" @click='setupPeriod(scope)' :type="scope.row.isDiscount?'primary':''"
            :disabled="!scope.row.isDiscount">贴息期数</el-button>
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

    <!-- 贴息期数 -->
    <el-dialog title="贴息期数" :visible.sync="dialogVisibleDistribution" width="730px" :before-close="handleCloseDialog"
      :close-on-click-modal='false' @close='handleCloseDialog'>
      <div class="common_transfer_wrapper">
        <el-transfer v-model="chosenData" :data="currentPeriodData.period" :titles="['可分配期数', '已分配期数']">
        </el-transfer>
      </div>

      <span slot="footer">
        <el-button @click="dialogVisibleDistribution = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitTransfer">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import CommonDynamicTags from '@/components/CommonDynamicTags/CommonDynamicTags.vue'

export default {
  name: 'DistributedProductsManagement',
  components: {
    CommonDynamicTags
  },
  data() {
    return {

      findMerchantDetailRequest: '/merchant/findMerchantDetail',
      findMerchantPeriodRequest: '/trade/findMerchantPeriod',
      saveMerchantPeriodRequest: '/trade/saveMerchantPeriod',


      findMerchantListRequest: '/merchant/findMerchantList',




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
      sortParams: '',
      roleQueryLoading: false,
      dialogVisibleDistribution: false,
      dialogVisible: false,
      dialogType: 0,

      currentPeriodData: {},
      chosenData: [],
      selectionData: [],
      tableLoading: true,
      tableData: [],
      originalProductData: [],

    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {

      return 'calc(100vh - 300px)'
    },
    dialogStyle() {
      return {
        height: 'calc(100vh - 250px)',
        overflow: 'auto'
      }
    },
    userInfo() {
      return this.$store.state.user.userInfo
    }

  },
  created() {
    this.getTableData()
  },
  mounted() {
  },
  methods: {
    getTableData() {
      console.log(this.userInfo)
      this.tableLoading = true
      let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
      this.$http.post(this.findMerchantDetailRequest, {
        id: this.userInfo.merchant.id
      }).then(async response => {
        console.log('response+++++', response)

        let responseData = response.data
        this.tableLoading = false
        responseData.trades.map(item => {
          return Object.assign(item, {
            // status: item.status === 1 ? true : false,
            // isDiscount: item.isDiscount === 1 ? true : false
          })
        })
        this.tableData = responseData.trades
        this.pagination.limit = response.total
        console.log('tableData+++++', this.tableData)


      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },

    getMerchantPeriodDataPromise(scope) {
      return new Promise((resolve, reject) => {
        this.$http.post(this.findMerchantPeriodRequest, {
          merchantId: this.userInfo.merchant.id,
          tradeId: scope.row.id
        }).then(async response => {
          console.log('getMerchantPeriodDataPromise++++++', response)
          let result = []
          if (response.data) {
            const responseData = response.data
            result = responseData.period ? responseData.period.split(',') : []
          }
          this.chosenData = result
          resolve(result)

        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })

    },
    async setupPeriod(scope) {
      this.chosenData = []
      this.currentPeriodData = {
        tradeId: '',
        merchantId: '',
        period: []
      }

      try {
        await this.getMerchantPeriodDataPromise(scope)
        this.dialogVisibleDistribution = true

        console.log(this.chosenData)
        this.chosenData = this.chosenData
        this.currentPeriodData = {
          tradeId: scope.row.id,
          merchantId: this.userInfo.merchant.id,
          period: scope.row.period.split(',').map(item => {
            return {
              key: item,
              label: item + '期',
              disabled: false
            }
          })
        }

        console.log(this.currentPeriodData.period)
        console.log(this.chosenData)

        console.log('setupPeriod++++++', this.tableData)
      } catch (error) {
        this.$message.error('此产品无法设置期数')
      }


    },
    handleSubmitTransfer() {
      this.$http.post(this.saveMerchantPeriodRequest, {
        merchantId: this.currentPeriodData.merchantId,
        tradeId: this.currentPeriodData.tradeId,
        period: this.chosenData.join(',')
      }).then(response => {
        this.$message.success('保存成功')
        this.getTableData()
        this.dialogVisibleDistribution = false
      }).catch(error => {
        console.log(error)
      })
    },
    handleSubmit(submitData) {
      console.log('this.tableData++++', this.tableData)

      console.log("submitData+++++", submitData)
      this.$http.post(this.saveMerchantPeriodRequest, submitData).then(response => {
        this.$message.success('保存成功')
        this.getTableData()
        this.dialogVisibleDistribution = false
      }).catch(error => { })
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
    handleCreate() {
      // this.dialogVisible = true
      // this.dialogType = 0
      this.$router.push({
        name: 'editMerchant',
        query: {
          type: 'create'
        }
      })
    },

    handleCloseDialog() {
      this.dialogVisibleDistribution = false
    },
    handleSort() { },
    checkIfDiscount(scope) {
      const isDiscount = scope.row.isDiscount
    }

  }
}

</script>


