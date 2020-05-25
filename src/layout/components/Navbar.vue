<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container"
      @toggleClick="toggleSideBar" />

    <!-- <breadcrumb class="common_breadcrumb_container" /> -->

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <!-- <search id="header-search" class="right-menu-item" /> -->
        <!-- <el-tooltip content="下载源码" effect="dark" placement="bottom"></el-tooltip> -->
        <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->
        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
                </el-tooltip>-->
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <span>{{$store.state.user.userInfo.name}}</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="changePassword">更改密码</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 更改密码 -->
    <el-dialog title="修改密码" :visible.sync="dialogVisible" width="800px" :before-close="handleCloseDialog"
      :close-on-click-modal='false' @close='handleCloseDialog'>
      <el-row type="flex" justify="center">
        <el-col :span='16'>
          <el-form ref="formData" :rules="rules" :model="formData" label-width="110px">
            <el-row>
              <el-form-item label="旧密码" prop='password'>
                <el-input v-model="formData.password" type='password'></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="新密码" prop='newPassword'>
                <el-input v-model="formData.newPassword" type='password'></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="确认新密码" prop='confirmNewPassword'>
                <el-input v-model="formData.confirmNewPassword" type='password'></el-input>
              </el-form-item>
            </el-row>
          </el-form>
        </el-col>
      </el-row>

      <span slot="footer">
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="submitResetPassword">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Hamburger from '@/components/Hamburger.vue'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.formData.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      updatePasswordRequest: '/user/updatePassword',
      // logoutRequest: '/logout',
      dialogVisible: false,
      formData: {
        id: '',
        password: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      rules: {
        password: [{
          required: true,
          message: '请输入旧密码',
          trigger: 'change'
        }],
        newPassword: [{
          required: true,
          message: '请输入新密码',
          trigger: 'change'
        }],
        confirmNewPassword: [{
          required: true,
          validator: validatePass,
          trigger: 'blur'
        }]
      },
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  methods: {
    handleCloseDialog() {
      this.$refs.formData.resetFields()
      this.dialogVisible = false
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleCommand(command) {
      switch (command) {
        case 'logout':
          this.logout()
          break;
        case 'changePassword':
          this.changePassword()
          break;
      }
    },
    changePassword() {
      this.dialogVisible = true
    },
    submitResetPassword() {

      this.$refs.formData.validate(valid => {
        if (valid) {

          this.$http.post(this.updatePasswordRequest, {
            id: this.$store.state.user.userInfo.id,
            password: this.formData.password,
            newPassword: this.formData.newPassword
          }).then(response => {
            console.log(response)
            this.dialogVisible = false
            this.$message.success('修改成功')
            this.$store.dispatch('logout').then(response => {
              this.$router.push({
                name: 'login',

              })
            })
          }).catch(error => {
            this.$message.error(error)
            console.log(error)
          })
        }
      })
    },
    async logout() {

      const that = this
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem("loginFlag");
        this.$store.dispatch('logout').then(response => {
          this.$router.push({
            name: 'login',
            // query: {
            //   action: 'reload'
            // }
          })
        }).catch(error => {
          this.$message.error(error)
        })
      })
    },

  }
}

</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    display: inline-block;
    margin: 0 25px;
    /* line-height: 46px; */
    height: 100%;
    /* float: left; */
    vertical-align: middle;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }

    &:before {
      content: "";
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    /* line-height: 50px; */

    &:focus {
      outline: none;
    }

    &:before {
      content: "";
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      /* height: 100%; */
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      padding: 0 25px 0 0;

      .avatar-wrapper {
        position: relative;
        color: #000;

        .user-avatar {
          display: inline-block;
          cursor: pointer;
          width: 24px;
          border-radius: 50%;
          vertical-align: middle;
        }

        span {
          display: inline-block;
          margin: 0 8px;
          cursor: pointer;
          vertical-align: middle;
          /* position: absolute; */
          /* right: -20px; */
          /* top: 25px; */
          font-size: 14px;
          opacity: 1;
        }
      }
    }
  }
}
</style>