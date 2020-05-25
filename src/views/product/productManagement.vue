<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:operation>
        <ul>
          <li v-if="$checkAuthority($route, 'save')">
            <el-button class="blue" type="primary" @click='handleAddRow'>添加</el-button>
          </li>
          <li v-if="$checkAuthority($route, 'save')">
            <el-button type="success" @click='handleSubmit'>保存</el-button>
          </li>
          <li v-if="$checkAuthority($route, 'delete')">
            <el-button type="danger" @click='handleMultipleDelete'>删除</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>
    <el-table ref='tableData' :data="tableData" :height='tableHeight' v-loading="tableLoading" @sort-change='handleSort'
      @select='handleSelect' @selection-change='handleSelectionChange' @select-all='handleSelectAll'
      @blur='handleCancelValueAll'>
      <el-table-column type="selection" width="55"> </el-table-column>

      <el-table-column prop="name" label="名称" width="300">
        <template slot-scope="scope">
          <div v-if='tableData[scope.$index].name.editing'>
            <div class="tableeditor_wrapper">
              <div class="input">
                <el-input v-model="tableData[scope.$index].name.value"></el-input>
              </div>
              <div class="operation">
                <el-button type="primary" icon='el-icon-check' circle @click='handleConfirmValue(scope)'></el-button>
                <el-button type="danger" icon='el-icon-close' circle @click='handleCancelValue(scope)'></el-button>
              </div>
            </div>
          </div>
          <div v-else class="editablecell" @click='handleEditTableRow(scope)'>
            {{tableData[scope.$index].name.value}}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="period" label="期数">
        <template slot-scope="scope">
          <div v-if='tableData[scope.$index].period.editing'>
            <div class="tableeditor_wrapper">
              <CommonDynamicTags :activate.sync='tableData[scope.$index].period.editing'
                :tagsModel.sync='tableData[scope.$index].period.value' subfix='期' :editable='true' />

              <div class="operation">
                <!-- <el-button type="primary" icon='el-icon-check' circle @click='handleConfirmValue(scope)'></el-button>
                <el-button type="danger" icon='el-icon-close' circle @click='handleCancelValue(scope)'></el-button> -->
              </div>
            </div>
          </div>
          <div v-else class="editablecell" @click='handleEditTableRow(scope)'>
            <!-- {{tableData[scope.$index].period.value}} -->
            <div class="common_dynamictag_wrapper">
              <ul>
                <li v-for='(item, index) in $splitString(tableData[scope.$index].period.value)' :key='index'>
                  <el-tag size="small">{{item}}期</el-tag>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="isDiscount" label="贴息" width="150">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isDiscount" active-color="#13ce66" inactive-color="#ccc" active-text="是"
            inactive-text="否">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="150">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ccc" active-text="启用"
            inactive-text="冻结">
          </el-switch>
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
    <el-dialog title="配置期数" :visible.sync="dialogVisibleSetupPeriod" width="500px" :before-close="handleClose"
      :close-on-click-modal='false' @close='handleCloseDialog'>

      <span slot="footer">
        <el-button @click="dialogVisibleSetupPeriod = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import CommonDynamicTags from '@/components/CommonDynamicTags/CommonDynamicTags.vue'

export default {
  name: 'ProductManagement',
  components: {
    CommonDynamicTags
  },
  data() {
    return {
      findTradeListRequest: '/trade/findTradeList',
      saveTradeRequest: '/trade/saveTrade',
      deleteTradeRequest: '/trade/deleteTrade',


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
      dialogVisible: false,
      dialogType: 0,
      dialogVisibleSetupPeriod: false,
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
      tableFormData: [],
      tableData: [],
      roleQueryListData: [],
      tablePeriodData: [],



      inputValue: '',
      inputVisible: '',
      inputValue: '',
      dynamicTags: '',
    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {

      return 'calc(100vh - 320px)'
    }
  },
  watch: {
    tableData(value) {
      console.log('tableData++++', value)
    }
  },
  created() {
    this.$checkAuthority(this.$route, 'list') ? this.getTableData() : this.tableLoading = false

  },
  mounted() {
  },
  methods: {
    getTableData() {
      this.tableLoading = true
      let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
      this.$http.post(this.findTradeListRequest, {
        pageNum: this.pagination.page,
        pageSize: this.pagination.size
      }).then(async response => {
        let responseData = response.data
        this.tableLoading = false
        responseData.map(item => {
          return Object.assign(item, {
            status: item.status === 1 ? true : false,
            isDiscount: item.isDiscount === 1 ? true : false
          })
        })
        console.log('tableData+++++', responseData)
        // await this.$nextTick()
        this.tableData = responseData
        this.tableData.map(item => {
          return Object.assign(item, {
            name: {
              editing: false,
              value: item.name
            },
            period: {
              editing: false,
              value: item.period
            }
          })
        })
        this.tablePeriodData = this.tableData.map(item => {
          let result = item.period.value ? item.period.value.split(',') : []
          return result
        })
        this.tableFormData = responseData
        this.pagination.limit = response.total


      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },
    getOptions(periodData) {
      periodData.split(",").map(item => {
        return {
          label: item,
          value: item
        }
      })
    },
    handleAddRow() {
      this.tableData.push({
        name: {
          editing: false,
          value: ''
        },
        period: {
          editing: false,
          value: ''
        },
        status: 0,
        isDiscount: 0,
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
    async handleEditTableRow(scope) {
      this.tableData.forEach((item, index) => {
        Object.keys(this.tableData[index]).forEach((item2, index2) => {
          if (this.tableData[index][item2].editing === true) {
            this.tableData[index][item2].editing = false
            this.tableData[index][item2].value = this.tempValue
          }
        })
      })
      this.tableData[scope.$index][scope.column.property].editing = true
      this.tempValue = this.tableData[scope.$index][scope.column.property].value
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
            result.isDiscount = this.$booleanToNumber(item.isDiscount, 1, 0)
          }
        })
        return result
      })
      return submitData

    },
    handleSubmit() {
      const submitData = this.transformToOriginalData(this.tableData)
      console.log(submitData)
      this.$http.post(this.saveTradeRequest, submitData).then(response => {
        this.$message.success('保存成功')
        this.getTableData()
      }).catch(error => { })
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
        let submitData = this.transformToOriginalData(this.selectionData)

        console.log(submitData)

        this.$http.post(this.deleteTradeRequest, submitData).then(response => {
          this.$message.success('删除成功')
          this.getTableData()
        }).catch(error => {
          this.$message.error(error)
        })
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
    handleCancelValueAll() {
      console.log('handleCancelValueAll')
      this.tableData.forEach((item, index) => {
        Object.keys(this.tableData[index]).forEach((item2, index2) => {
          this.tableData[index][item2].editing = false
        })
      })
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
      this.dialogVisible = true
      this.dialogType = 0
    },
    async handleEdit(scope) {
      this.dialogVisible = true
      this.dialogType = 1
      await this.$nextTick()
      this.formData = {
        "code": scope.row.code,
        "id": scope.row.id,
        "name": scope.row.name,
      }
    },
    handleCloseDialog() {
      // this.$refs.formData.resetFields()
      this.dialogVisible = false
    },
    setupPeriod(scope) {
      console.log('setupPeriod+++++', scope)
      this.dialogVisibleSetupPeriod = true
    },
    handleClose() {
      this.dialogVisibleSetupPeriod = false
    },


  }
}

</script>

