<template>
  <div class="user_main_container" :style="containerStyle">
    <div class="common_tree_container">
      <div class="tree_wrapper">
        <el-tree :data="treeData" ref='tree' node-key="id" :default-expand-all='true' :props="defaultProps"
          :expand-on-click-node='false' :allow-drop="allowDrop" :allow-drag="allowDrag" :highlight-current='true'
          :indent='25'>
          <div class="customtreenode" slot-scope="{ node, data }">
            <p class="title" @click='checkDetail(data)'>{{ node.data.title }}</p>
            <div class="operation">
              <el-tooltip v-if="data.dataType==='menu'" class="item" effect="dark"
                :content="'添加'+treeDataDictionary.find(item=>item.id===data.id).dataTypeTitle" placement="top-start">
                <el-button class="add" type="text" size="mini" @click="handleAppendSiblingNode(node, data,treeData)">
                  <i class="el-icon-plus" :class="treeDataDictionary.find(item=>item.id===data.id).color"></i>
                </el-button>
              </el-tooltip>

              <el-tooltip v-if="data.dataType!=='method'" class="item"
                :content="'在'+node.data.title+'下'+'添加'+getSubnodeType(data.dataType)" placement="top-start">
                <el-button class="add" type="text" size="mini" @click="handleAppendChildNode(node, data,treeData)">
                  <i class="el-icon-folder-add" :class="treeDataDictionary.find(item=>item.id===data.id).color"></i>
                </el-button>
              </el-tooltip>

              <el-button class="delete" type="text" size="mini" @click="handleRemoveNode(node, data)">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
        </el-tree>
      </div>
    </div>

    <div class="splitline"></div>
    <CommonFrame title='编辑'>
      <template v-slot:content>
        <div class="common_form_container">
          <el-form ref="formData" :model="formData" label-width="80px" :rules='rules'>
            <el-form-item label="名称" prop='name'>
              <el-input v-model="formData.name"></el-input>
            </el-form-item>
            <el-form-item label="路径" prop='path'>
              <el-input v-model="formData.path"></el-input>
            </el-form-item>
            <el-form-item label="别名" prop='code'>
              <el-input v-model="formData.code"></el-input>
            </el-form-item>
            <el-form-item label="类型" prop='type'>
              <el-radio v-model="formData.type" label="menu" :disabled="formData.type!=='menu'">菜单</el-radio>
              <el-radio v-model="formData.type" label="page" :disabled="formData.type!=='page'">页面</el-radio>
              <el-radio v-model="formData.type" label="method" :disabled="formData.type!=='method'">方法</el-radio>
            </el-form-item>
            <el-form-item label="顺序" prop='sequence'>
              <el-input v-model.number="formData.sequence"></el-input>
            </el-form-item>

            <div class="footer">
              <el-form-item>
                <el-button v-if="$checkAuthority($route, 'save')" type='primary' @click='handleSubmit'>保存</el-button>

              </el-form-item>
            </div>
          </el-form>
        </div>

      </template>
    </CommonFrame>

    <!-- 新增节点 -->
    <el-dialog :title="'新增节点'+currentParentNodeTitle" :visible.sync="dialogVisible" width="500px"
      :before-close="handleClose" :close-on-click-modal='false' @close='handleCloseDialog'>
      <div class="common_form_container">
        <el-form ref="formData" :model="formData" label-width="80px" :rules='rules'>
          <el-form-item label="名称" prop='name'>
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item label="路径" prop='path'>
            <el-input v-model="formData.path"></el-input>
          </el-form-item>
          <el-form-item label="别名" prop='code'>
            <el-input v-model="formData.code"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop='type'>
            <el-radio v-model="formData.type" label="menu" :disabled="formData.type!=='menu'">菜单</el-radio>
            <el-radio v-model="formData.type" label="page" :disabled="formData.type!=='page'">页面</el-radio>
            <el-radio v-model="formData.type" label="method" :disabled="formData.type!=='method'">方法</el-radio>
          </el-form-item>
          <el-form-item label="顺序" prop='sequence'>
            <el-input v-model.number="formData.sequence"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'AuthoritySettings',

  data() {
    return {
      findRoleListRequest: '/role/findRoleList',
      saveUserRequest: '/user/saveUser',
      findPermissionDetailRequest: '/permission/findPermissionDetail',
      savePermissionRequest: '/permission/savePermission',


      findIndexPermissionRequest: 'permission/findIndexPermission',
      saveAuthRoleRequest: '/role/authRole',
      findRolePermissionRequest: '/permission/findRolePermission',
      findPermissionListRequest: '/permission/findPermissionList',
      deletePermissionRequest: '/permission/deletePermission',

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
      authorityTypeDictionary: [{
        title: '菜单',
        code: 'menu'
      }, {
        title: '页面',
        code: 'page'
      }, {
        title: '方法',
        code: 'method'
      }],
      formData: {
        id: '',
        name: '',
        path: "",
        code: "",
        type: "",
        parentId: null,
        sequence: null,

      },
      rules: {
        name: [{
          required: true,
          message: '请输入名称',
          trigger: 'change'
        }],
        path: [{
          required: true,
          message: '请输入路径',
          trigger: 'change'
        }],
        type: [{
          required: true,
          message: '请选择类型',
          trigger: 'change'
        }],
        sequence: [{
          required: false,
          message: '请输入顺序',
          trigger: 'change'
        }, { type: 'number', message: '顺序必须为数字值' }],
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
      roleList: [],
      merchantList: [],
      currentNodeData: {},
      currentParentNodeData: null,
      treeDataDictionary: []
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
    accountStatusDictionary() {
      return this.$store.state.app.accountStatusDictionary

    },
    currentParentNodeTitle() {
      return this.currentParentNodeData ? '(' + this.currentParentNodeData.title + ')' : ''
    }

  },
  created() {
    this.getTreeData()
  },
  mounted() {
    this.$showUrlMessage(this.$route.query.message)
  },
  methods: {
    getTreeData() {
      this.$http.post(this.findPermissionListRequest, {}).then(response => {
        console.log('getTreeData++++', response.data)

        this.treeData = response.data
        this.getNodeTypeColor(response.data)

      }).catch(error => {
        console.log(error)
      })
    },
    setupAuthority(scope) {
      this.currentRoleId = scope.row.id
      this.$http.post(this.findRolePermissionRequest, {
        id: this.currentRoleId
      }).then(response => {
        console.log('setupAuthority++++', response)
        this.checkedKeys = this.getCheckedKey(response.data)
        this.$refs.tree.setCheckedKeys(this.checkedKeys);

        console.log('this.getCheckedKey(response.data)+++++', this.getCheckedKey(response.data))
        console.log('this.checkedKeys++++', this.checkedKeys)
      }).catch(error => {
        console.log(error)
      })
    },
    getCheckedKey(data) {
      const result = []
      data.forEach(item => {
        if (item.checked === true) {
          result.push(item.id)
        }
        if (item.children && item.children instanceof Array) {
          result.push(...this.getCheckedKey(item.children))
        }
      })
      return result
    },
    handleSubmit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          console.log(this.formData)

          this.$http.post(this.savePermissionRequest, {
            id: this.formData.id,
            name: this.formData.name,
            parentId: this.formData.parentId,
            path: this.formData.path,
            code: this.formData.code,
            sequence: this.formData.sequence,
            type: this.formData.type,
          }).then(response => {
            console.log(response)
            this.getTreeData()
            this.dialogVisible = false
            this.$refs.formData.resetFields()
            this.$message.success('保存成功')
            // location.reload();
          })
        }

      })

    },
    getParentId(parentData, id, nodeData) {
      let parentId = ''
      if (nodeData.dataType === 'menu') {
        parentId = 1
        return parentId
      }
      const loop = (parentData, id) => {
        parentData.forEach(item => {
          if (!!item.children && item.children.length > 0) {
            item.children.forEach(item2 => {
              if (item2.id === id) {
                parentId = item.id
              }
            })
            if (parentId === '') {
              loop(item.children, id)
            }
          }
        })
      }
      loop(parentData, id)

      return parentId
    },
    async handleAppendSiblingNode(node, data, treeData) {
      console.log(node)
      console.log(data)
      console.log(treeData)
      this.currentNodeData = data
      const parentId = this.getParentId(treeData, data.id, data)
      console.log('treeData+++', treeData)
      console.log(data.id)
      console.log(parentId)

      this.currentParentNodeData = this.treeDataDictionary.find(item => item.id === parentId) || null
      await this.$nextTick()
      this.dialogVisible = true
      this.$refs.formData.resetFields()

      this.formData.id = ''
      this.formData.parentId = parentId
      this.formData.type = data.dataType
      this.formData.dataTypeTitle = data.dataTypeTitle
    },
    async handleAppendChildNode(node, data, treeData) {
      console.log(node)
      console.log(data)
      console.log(treeData)
      this.currentNodeData = data
      console.log('treeData+++', treeData)
      console.log(data.id)

      await this.$nextTick()
      this.dialogVisible = true
      this.$refs.formData.resetFields()

      this.formData.id = ''
      this.formData.parentId = data.id
      this.formData.type = this.getChildrenDataType(data.dataType)
      // this.formData.dataTypeTitle = data.dataTypeTitle
    },
    getChildrenDataType(parentDataType) {
      let result = ''
      switch (parentDataType) {
        case 'menu':

          result = 'page'
          break
        case 'page':
          result = 'method'
          break
        default:
          result = ''
      }
      return result
    },
    append(data) {

      data.children.push(newChild);
    },
    handleRemoveNode(node, data) {
      console.log('handleRemoveNode++++', data)
      this.$confirm(`确定删除“${data.title}”（${data.dataTypeTitle}）？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(this.deletePermissionRequest, {
          id: data.id
        }).then(response => {
          this.$router.push({
            name: 'authoritySettings',
            query: {
              message: 'delete'
            }
          })
          // this.$message.success('删除成功')
          this.getTreeData()
        }).catch(error => {
          this.$message.error('删除失败')
        })
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
    async checkDetail(data) {
      const id = data.id
      console.log('data+++++', data)
      // await this.$nextTick()
      this.$http.post(this.findPermissionDetailRequest, { id }).then(response => {
        console.log(response)

        this.formData = response.data

      }).catch(error => {
        console.log(error)
      })
    },

    handleCloseDialog() {
      this.$refs.formData.resetFields()
      this.dialogVisible = false
    },
    handleClose() {
      this.dialogVisible = false

    },

    checkActive(data) {
      console.log(data)
    },
    handleDragStart(node, ev) {
      console.log('drag start', node);
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      console.log('tree drag enter: ', dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      console.log('tree drag leave: ', dropNode.label);
    },
    handleDragOver(draggingNode, dropNode, ev) {
      console.log('tree drag over: ', dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('tree drop: ', dropNode.label, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {

    },
    allowDrag(draggingNode) {

    },
    getNodeTypeColor(treeData) {
      let level = 0

      let result = []
      const getLevel2 = (data, treeData, level) => {
        level++
        treeData.forEach(item1 => {
          result.push(Object.assign(item1, {
            level: level
          }))
          if (!!item1.children) {
            getLevel2(item1, item1.children, level)
          }
        })
      }

      this.treeData.forEach(item => {
        getLevel2(item, treeData, level)
        // console.log('getlevel2++++', result)

        result.forEach((item2, index) => {
          switch (result.find(item => item.id === item2.id).level) {
            case 1:
              result[index].color = 'red'
              result[index].dataType = 'menu'
              result[index].dataTypeTitle = '菜单'
              break;
            case 2:
              result[index].color = 'blue'
              result[index].dataType = 'page'
              result[index].dataTypeTitle = '页面'
              break;
            case 3:
              result[index].color = 'green'
              result[index].dataType = 'method'
              result[index].dataTypeTitle = '方法'
              break;
          }
        })
      })

      this.treeDataDictionary = result
      console.log('treeDataDictionary+++++', this.treeDataDictionary)
      return result
    },
    getSubnodeType(data) {
      let result = ''
      switch (data) {
        case 'menu':
          result = '页面'
          break;

        case 'page':
          result = '方法'
          break;

      }
      return result
    }




  }
}

</script>

