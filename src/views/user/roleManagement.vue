<template>
  <div class="user_main_container" :style="containerStyle">
    <div class="common_table_container">
      <TableHeader>
        <template v-slot:formWrapper></template>
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
      <el-table :data="tableData" :height='tableHeight' v-loading="tableLoading" @select='handleSelect'
        @selection-change='handleSelectionChange' @select-all='handleSelectAll'>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="name" label="名称">
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
            <div v-else class="editablecell" @click.self='handleEditTableRow(scope)'>
              {{tableData[scope.$index].name.value}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Code">
          <template slot-scope="scope">
            <div v-if='tableData[scope.$index].code.editing'>
              <div class="tableeditor_wrapper">
                <div class="input">
                  <el-input v-model="tableData[scope.$index].code.value"></el-input>
                </div>
                <div class="operation">
                  <el-button type="primary" icon='el-icon-check' circle @click='handleConfirmValue(scope)'></el-button>
                  <el-button type="danger" icon='el-icon-close' circle @click='handleCancelValue(scope)'></el-button>
                </div>
              </div>
            </div>
            <div v-else class="editablecell" @click.self='handleEditTableRow(scope)'>
              {{tableData[scope.$index].code.value}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ccc" active-text="启用"
              inactive-text="冻结">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click='setupAuthority(scope)' :type="checkActive(scope)">权限分配</el-button>
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
    </div>
    <div class="splitline"></div>
    <div class="common_tree_container">
      <div class="header">
        <ul class="operation">
          <li v-if="$checkAuthority($route, 'save')">
            <el-button type="success" @click='handleSaveTree' :disabled="currentRoleId===''">保存</el-button>
          </li>
        </ul>
      </div>
      <div class="tree_wrapper" :style="treeStyle">
        <el-tree :data="treeData" ref='tree' show-checkbox expand-on-click-node node-key="id" :default-expand-all='true'
          :props="defaultProps" :check-strictly='checkStrictly' check-on-click-node :indent='25'>
        </el-tree>
      </div>
    </div>

  </div>

</template>

<script>
export default {
  name: 'RoleManagement',

  data() {
    return {
      findRoleListRequest: '/role/findRoleList',
      saveRoleRequest: '/role/saveRole',
      deleteRoleRequest: '/role/deleteRole',
      saveAuthRoleRequest: '/role/authRole',
      findPermissionListRequest: '/permission/findPermissionList',

      checkStrictly: true,
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
        account: '',
        name: '',
        status: '',
      },
      pagination: {
        page: 1,
        size: 10,
        limit: 0
      },
      treeData: [],
      currentRoleId: '',
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      checkedKeys: [],

      sortParams: '',
      roleQueryLoading: false,
      dialogVisible: false,
      dialogType: 0,


      selectionData: [],
      tableLoading: true,
      tableData: [],
      tableFormData: [],
      roleList: [],
      merchantList: [],
    }
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    containerStyle() {
      return {
        height: 'calc(100vh - 200px)'
      }
    },
    treeStyle() {
      return {
        height: 'calc(100% - 70px)'
      }
    },
    accountStatusDictionary() {
      return this.$store.state.app.accountStatusDictionary

    },
    userInfo() {
      return this.$store.state.user.userInfo
    }

  },
  created() {
    this.$checkAuthority(this.$route, 'list') ? this.getTableData() : this.tableLoading = false
    this.getTreeData()
  },
  mounted() {
    this.$showUrlMessage(this.$route.query.message)
  },
  methods: {
    getTableData() {
      this.tableLoading = true

      this.$http.post(this.findRoleListRequest, {}).then(async response => {
        let responseData = response.data
        this.tableLoading = false
        console.log('tableData+++++', responseData)

        responseData.map(item => {
          return Object.assign(item, {
            status: item.status === 1 ? true : false
          })
        })
        this.tableData = responseData
        this.tableData.map(item => {
          return Object.assign(item, {
            name: {
              editing: false,
              value: item.name
            },
            code: {
              editing: false,
              value: item.code
            },
          })
        })
        this.tableFormData = responseData
        this.pagination.limit = response.total
      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },
    getTreeData() {
      this.$http.post(this.findPermissionListRequest, {}).then(response => {
        console.log('getTreeData++++', response.data)
        response = response.data
        const loop = response => {
          let result = []
          response.forEach(item => {
            let temp = JSON.parse(JSON.stringify(item))
            // temp.title = item.id + item.title
            temp.title = item.title
            // temp.parentId = item.id
            if (!!item.children && item.children.length > 0) {
              temp.children = []
              temp.children.push(...loop(item.children))
            }
            result.push(temp)
          })
          return result
        }
        response = loop(response)
        this.treeData = response
      }).catch(error => {
        console.log(error)
      })

    },
    setupAuthority(scope) {
      console.log('setupAuthority2222+++++', scope)
      this.currentRoleId = scope.row.id
      this.$store.dispatch('permission/findRolePermission', {
        id: this.currentRoleId
      }).then(response => {
        console.log('setupAuthority++++', response)

        this.checkedKeys = this.getCheckedKey(response)
        console.log('getCheckedKey++++', this.checkedKeys)

        this.$refs.tree.setCheckedKeys(this.checkedKeys);
        // const halfCheckedKeys = this.$refs.tree.getHalfCheckedNodes()


      }).catch(error => {
        console.log(error)
      })

    },
    getCheckedKey(children) {
      let result = []
      const loop = children => {
        const result = []
        children.forEach(item => {
          if (item.checked === true) {
            result.push(item.id.toString())
          }
          if (item.children && item.children instanceof Array) {
            result.push(...loop(item.children))
          }
        })
        return result
      }
      result = loop(children)

      return result
    },

    handleSaveTree() {
      console.log('handleSaveTree+++++', this.treeData)
      const transformedTreeData = this.transformTree(this.treeData)
      const checkedKeys = this.$refs.tree.getCheckedNodes(false, true)
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedNodes()

      console.log('checkedKeys++++++', checkedKeys)
      console.log('halfCheckedKeys++++++', halfCheckedKeys)
      let submitTreeData1 = []
      let submitTreeData2 = []
      submitTreeData1 = transformedTreeData.filter(item => {
        let result = checkedKeys.find(item2 => item2.id === item.id)
        return result
      }).map(item => {
        return Object.assign(item, {
          checked: true,
          spread: true
        })
      })

      submitTreeData2 = transformedTreeData.filter(item => {
        let result = halfCheckedKeys.find(item2 => item2.id === item.id)
        return result
      }).map(item => {
        return Object.assign(item, {
          checked: true,
          spread: true
        })
      })
      const submitTreeData = submitTreeData1.concat(submitTreeData2)

      console.log('submitTreeData++++++', submitTreeData)

      console.log('transformedTreeData++++++', transformedTreeData)
      console.log('submitTreeData++++++', submitTreeData)


      this.$http.post(this.saveAuthRoleRequest + '?roleId=' + this.currentRoleId, submitTreeData).then(response => {
        console.log(response)
        console.log(this.userInfo)
        setTimeout(() => {
          if (this.currentRoleId === this.userInfo.role.id) {

            this.$router.push({
              name: 'roleManagement',
              query: {
                message: 'save'
              }
            })
            location.reload()

          } else {
            this.dialogVisible = false
            this.currentRoleId = ''
            this.getTableData()
            this.$message.success('保存成功')

          }
        }, 500)



      }).catch(error => {
        console.log(error)
      })
    },
    transformTree(children) {
      const loop = children => {
        const childrenResult = []
        children.forEach(item1 => {
          let childrenData = []
          let childData = JSON.parse(JSON.stringify(item1))
          childrenResult.push(Object.assign(childData, {
            children: childData.children && childData.children.length > 0 ? [] : null
          }))
          if (!!item1.children && item1.children.length > 0) {
            childrenResult.push(...loop(item1.children))
          }
        })
        return childrenResult
      }
      return loop(children)
    },
    recheckTree(data) {
      console.log('recheckTree+++++', data)
      let result1 = []
      let result2 = []

      let checkedKeys = this.$refs.tree.getCheckedNodes().map(item => item.id)
      let firstLevelKeys = data.map(item => item.id)
      const recheck = data3 => {
        let result2 = []
        data3.forEach((item, index) => {
          let result3 = item
          let deleteFlag = false
          if (firstLevelKeys.find(item2 => item2 === item.id)) {
            result3 = Object.assign(item, {
              checked: true
            })
          } else if (checkedKeys.find(item2 => item2 === item.id)) {
            result3 = Object.assign(item, {
              checked: true
            })
          } else {
            deleteFlag = true
          }
          if (!deleteFlag) {
            if (result3.children && result3.children instanceof Array) {
              result3.children = recheck(result3.children)
            } else {
              delete result3.children
            }
            result2.push(result3)
          }
        })
        return result2
      }
      result1 = recheck(data)
      return result1
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

        this.$http.post(this.deleteRoleRequest, submitData).then(response => {
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
    handleAddRow() {
      this.tableData.push({
        name: {
          editing: false,
          value: ''
        },
        code: {
          editing: false,
          value: ''
        }
      })
    },
    async handleEdit(scope) {
      this.dialogVisible = true
      this.dialogType = 1
      await this.$nextTick()
      this.formData = {
        "id": scope.row.id,
        "name": scope.row.name,
        "code": scope.row.code,
        "account": scope.row.account,
        "phone": scope.row.phone,
        "email": scope.row.email,
        "status": scope.row.status,
        "role": scope.row.role.id,
        "merchant": scope.row.merchant.code,
      }
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
    handleConfirmValue(scope) {
      this.tableData[scope.$index][scope.column.property].editing = false
    },
    handleCancelValue(scope) {
      this.tableData[scope.$index][scope.column.property].value = this.tempValue
      this.tableData[scope.$index][scope.column.property].editing = false
    },
    handleCloseDialog() {
      this.$refs.formData.resetFields()
      this.dialogVisible = false
    },
    handleClose() {
      this.dialogVisible = false

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
      this.$http.post(this.saveRoleRequest, submitData).then(response => {
        this.$message.success('保存成功')
        this.getTableData()
      }).catch(error => { })
    },
    checkActive(scope) {
      console.log(scope)
      if (this.currentRoleId === scope.row.id) {
        return 'primary'
      } else {
        return ''

      }
    }



  }
}

</script>

