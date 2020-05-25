<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="queryParams" label-width="80px">
          <el-row>
            <el-col :span='6'>
              <el-form-item label="账号">
                <el-input v-model="advanceQueryParams.account" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='6'>
              <el-form-item label="用户名">
                <el-input v-model="advanceQueryParams.name" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='6'>
              <el-form-item label="状态">
                <el-select v-model="advanceQueryParams.status" placeholder="请选择" clearable>
                  <el-option v-for='item in accountStatusDictionary' :key='item.value' :label="item.title"
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
          <li v-if="$checkAuthority($route, 'save')">
            <el-button type="success" @click='handleCreate'>添加</el-button>
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
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="account" label="账号"> </el-table-column>
      <el-table-column prop="phone" label="手机号"> </el-table-column>
      <el-table-column prop="role" label="角色">
        <template slot-scope="scope">
          {{scope.row.role.name}}
        </template>
      </el-table-column>
      <el-table-column prop="merchant" label="商户">
        <template slot-scope="scope">
          {{scope.row.merchant.name}}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <div v-if="$checkAuthority($route, 'updateStatus')">
            <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ccc"
              @change='handleChangeStatus(scope)' active-text="启用" inactive-text="冻结"> </el-switch>
          </div>
          <div v-else>
            <el-tag v-if='scope.row.status===0' size="small" type="danger">冻结</el-tag>
            <el-tag v-else size="small" type="success">启用</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <!-- <el-button v-if="$checkAuthority($route, 'save')" type='primary' @click='handleEdit(scope)'>编辑</el-button> -->
          <el-button v-if="$checkAuthority($route,'resetPassword')" type='primary' @click='handleResetPassword(scope)'>
            重置密码</el-button>
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

    <!-- 新增编辑用户 -->
    <el-dialog :title="dialogStatus+'用户'" :visible.sync="dialogVisible" width="800px" :before-close="handleCloseDialog"
      :close-on-click-modal='false' @close='handleCloseDialog'>
      <el-row type="flex" justify="center">
        <el-col :span='16'>
          <el-form ref="formData" :rules="rules" :model="formData" label-width="80px">
            <el-row>
              <el-form-item label="姓名" prop='name'>
                <el-input v-model="formData.name" :disabled="dialogType===1"></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="手机号" prop='phone'>
                <el-input v-model="formData.phone" :disabled='dialogType===1' @change='handleChangeAccount'></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="账号" prop='account'>
                <el-input v-model="formData.account" disabled></el-input>
              </el-form-item>
            </el-row>

            <el-row>
              <el-form-item label="密码">
                <el-input v-model="password" disabled></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="状态" prop='status'>
                <el-switch v-model="formData.status" active-color="#13ce66" inactive-color="#ccc" active-text="启用"
                  inactive-text="冻结">
                </el-switch>
              </el-form-item>
            </el-row>
            <!-- {{getRoleListByCode()}} -->
            <el-row v-if='getRoleListByCode().length>0'>
              <el-form-item label="角色" prop='role'>
                <el-radio-group v-model="formData.role">
                  <el-radio v-for='item in getRoleListByCode()' :key='item.code' :label="item.code">
                    {{item.title}}
                  </el-radio>
                </el-radio-group>

              </el-form-item>
            </el-row>
            <el-row v-else>
              <el-form-item label="角色" prop='role'>
                <el-radio-group v-model="formData.role">
                  <el-radio v-for='item in roleList' :key='item.id' :label="item.code">
                    {{item.name}}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>

            <el-row>
              <!-- {{[userInfo.role]}} -->
              <el-form-item label="商户" prop='merchant'>
                <!-- {{checkChooseMerchantAuthority()}} -->
                <el-select v-if='checkChooseMerchantAuthority()' v-model="formData.merchant" placeholder="请选择">
                  <el-option v-for="item in [userInfo.merchant]" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
                <el-select v-else v-model="formData.merchant" placeholder="请选择">
                  <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
                <!-- {{userInfo.merchant.name}} -->
              </el-form-item>
            </el-row>
          </el-form>
        </el-col>
      </el-row>

      <span slot="footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleCloseDialog">取 消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

export default {
  name: 'UserManagement',

  data() {
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.formData2.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      findUserListRequest: '/user/findUserList',
      findRoleListRequest: '/role/findRoleList',
      findMerchantListRequest: '/merchant/findMerchantList',
      saveUserRequest: '/user/saveUser',
      resetPasswordRequest: '/user/resetPassword',
      deleteUserRequest: '/user/deleteUser',
      updateUserStatusRequest: '/user/updateUserStatus',



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

      password: '123456',

      sortParams: '',
      roleQueryLoading: false,
      dialogVisible: false,
      dialogVisible2: false,
      dialogType: 0,

      formData: {
        "id": "",
        "name": "",
        "account": "",
        "phone": "",
        "email": "",
        "status": false,
        role: '',
        merchant: ''
      },

      selectionData: [],
      rules: {
        name: [{
          required: true,
          message: '请输入姓名',
          trigger: 'change'
        }],
        phone: [{
          required: true,
          message: '请输入手机',
          trigger: 'change'
        }, {
          pattern: /^1[3456789]\d{9}$/,
          trigger: 'blur',
          message: '请输入正确的手机号',
        }],
        account: [{
          required: false,
          message: '请输入账号',
          trigger: 'change'
          // }, {
          //   pattern: /^1[3456789]\d{9}$/,
          //   trigger: 'blur',
          //   message: '账号需为手机号',
        }],
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'change'
        }],
        status: [{
          required: true,
          message: '请选择状态',
          trigger: 'change'
        }],
        role: [{
          required: true,
          message: '请选择角色',
          trigger: 'change'
        }],
        merchant: [{
          required: true,
          message: '请选择商户',
          trigger: 'change'
        }]
      },

      tableLoading: true,
      tableData: [],
      roleList: [],
      roleListDictionary: [{
        code: 'merchant',
        title: '商户管理员',
        authority: ['subMerchant', 'checker']
      }, {
        code: 'subMerchant',
        title: '子商户管理员',
        authority: ['checker']
      }, {
        code: 'checker',
        title: '收银员',
        authority: []
      }],
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
    accountStatusDictionary() {
      return this.$store.state.app.accountStatusDictionary
    },
    userInfo() {
      return this.$store.state.user.userInfo
    },
    currentRouteData() {
      return this.$route
    }
  },
  created() {
    this.$checkAuthority(this.$route, 'list') ? this.getTableData() : this.tableLoading = false
    if (!this.roleListDictionary.find(item => item.code === this.userInfo.role.code)) {
      this.getRoleList()
      this.getMerchantList()
    }

  },
  mounted() {
  },
  methods: {
    getRoleListByCode() {
      const code = this.userInfo.role.code
      let authorityData = this.roleListDictionary.find(item => item.code === code)

      // authority = authority ? authority : []
      let result = []
      if (authorityData) {
        result = this.roleListDictionary.filter(item => {
          return authorityData.authority.find(item2 => item2 === item.code)
        })
      }


      return result
    },
    handleChangeStatus(scope) {
      this.$confirm('确认是否更改此用户状态？', '提示').then(() => {
        const submitData = {
          id: scope.row.id,
          status: scope.row.status ? 1 : 0
        }
        this.$http.post(this.updateUserStatusRequest, submitData).then(response => {
          this.$message.success('修改成功')
        }).catch(error => {
          this.$message.error('修改失败')

        })

      }).catch(error => {

        scope.row.status = !scope.row.status

      })
    },
    getTableData() {
      this.tableLoading = true
      let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
      const params = {
        account: advanceQueryParams.account,
        status: advanceQueryParams.status,
        name: advanceQueryParams.name,
        pageNum: this.pagination.page,
        pageSize: this.pagination.size
      }
      params.account === '' ? delete params.account : params.account
      params.status === '' ? delete params.status : params.status
      params.name === '' ? delete params.name : params.name
      console.log(params)
      this.$http.post(this.findUserListRequest, params).then(async response => {
        let responseData = response.data
        this.tableLoading = false
        console.log('tableData+++++', responseData)

        responseData.map(item => {
          return Object.assign(item, {
            status: item.status === 1 ? true : false
          })
        })
        this.tableData = responseData
        this.pagination.limit = response.total
      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },
    checkChooseMerchantAuthority() {
      const roleCode = this.userInfo.role.code;
      const merchantAuth = ['merchant', 'subMerchant', 'checker']
      let result = false
      if (merchantAuth.find(item => item === roleCode)) {
        result = true
      }
      return result
    },
    getRoleList() {
      this.$http.post(this.findRoleListRequest, {
        status: 1,
        // id: this.userInfo.role.id
      }).then(response => {
        const result = response.data.map(item => {
          return Object.assign(item, {
            status: item.status.toString()
          })
        })
        // const addUserDictionary = [{
        //   id: 1,
        //   authority: [1, 2, 3, 4]
        // }, {
        //   id: 2,
        //   authority: [3, 4]
        // }, {
        //   id: 3,
        //   authority: [7]
        // }, {
        //   id: 4,
        //   authority: [7]
        // }, {
        //   id: 7,
        //   authority: []
        // }]
        // const currentAuthority = addUserDictionary.find(item => item.id === this.userInfo.role.id)
        // this.roleList = result.filter(item => {
        //   return currentAuthority.authority.find(item2 => item2 === item.id)
        // })
        this.roleList = result
        console.log('this.roleList+++', this.roleList)
      }).catch(error => {
        console.log(error)
      })
    },
    getMerchantList() {
      this.$http.post(this.findMerchantListRequest, {
        status: 1
      }).then(response => {
        this.merchantList = response.data.map(item => {
          return {
            id: item.id,
            name: item.name
          }
        })
        console.log('getMerchantList+++++', this.merchantList)
      }).catch(error => {
        console.log(error)
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

    checkOrder() {

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

        this.$http.post(this.deleteUserRequest, submitData).then(response => {
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
    handleCreate() {
      this.dialogVisible = true
      this.dialogType = 0
    },
    async handleEdit(scope) {
      this.dialogVisible = true
      this.dialogType = 1
      await this.$nextTick()
      this.formData = {
        "id": scope.row.id,
        "name": scope.row.name,
        "account": scope.row.account,
        "phone": scope.row.phone,
        "status": scope.row.status,
        "role": scope.row.role.id,
        "merchant": scope.row.merchant.id,
      }
    },
    handleCloseDialog() {

      this.$refs.formData.resetFields()
      this.dialogVisible = false

    },

    handleSubmit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.$http.post(this.saveUserRequest, {
            "id": this.formData.id,
            "name": this.formData.name,
            "account": this.formData.account,
            "phone": this.formData.phone,
            "status": this.formData.status ? '1' : '0',
            role: {
              code: this.formData.role
            },
            merchant: {
              id: this.formData.merchant
            }
          }).then(response => {
            console.log(response)
            this.$message.success('提交成功')
            this.dialogVisible = false
            this.getTableData()
          }).catch(error => {
            console.log(error)
          })
        }

      })

    },
    handleChangeAccount(data) {
      console.log(data)
      this.formData.account = data
    },
    async handleResetPassword(scope) {
      this.dialogVisible2 = true
      await this.$nextTick()

      this.$confirm('确认重置密码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(this.resetPasswordRequest, {
          id: scope.row.id
        }).then(response => {
          this.$message.success('密码已重置')
        }).catch(error => {
          console.log(error)
        })
      }).catch(error => {
        console.log(error)
      })

    },

  }
}

</script>


