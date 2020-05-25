<template>
  <div>
    <div class="title">修改密码</div>

    <div class="common_vantform_wrapper">
      <van-cell-group>
        <van-form @sunmit='handleSubmit' ref='formData'>
          <van-field class="border" v-model="formData.loginName" label="账号：" name="account"
            :rules="[{ required: true, message: '请输入账号' }]" />

          <van-field class="border" v-model="formData.password" label="原密码：" name="account" type="password"
            :rules="[{ required: true, message: '请输入原密码' }]" />
          <van-field class="border" v-model="formData.newPassword" label="新密码：" name="account" type="password"
            :rules="[{ required: true, message: '请输入新密码' }]" />
          <van-field class="border" v-model="formData.confirmNewPassword" label="确认密码：" name="account" type="password"
            :rules="[{ required: true, message:'请再次输入密码'},
             {validator: validatePass, trigger: 'blur', message:'两次输入密码不一致'}]" />
          <!-- 通过 validator 进行异步函数校验 -->
          <div class="footer">
            <van-button round block type="info" @click='handleSubmit'>完成</van-button>
          </div>
        </van-form>
      </van-cell-group>

    </div>

  </div>

</template>

<script>
import { Notify } from 'vant';

export default {
  name: "changePasswordMobile",
  components: {
  },
  data() {

    return {
      loginRequest: '/login',
      updatePasswordRequest: '/user/updatePassword',
      formData: {
        loginName: "",
        password: "",
        id: '',
        password: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      active: 0,
      show: false,
    };
  },
  computed: {


  },
  watch: {

  },
  created() {
    this.$store.commit('app/updateHeader', {
      close: true,
      returnTo: 'loginMobile'
    })
  },
  methods: {
    validatePass(value, rule) {
      return value === this.formData.newPassword
    },
    onFailed(errorInfo) {
      console.log('failed', errorInfo);
    },
    handleSubmit() {
      console.log(this.formData)
      this.$refs.formData.validate().then(async valid => {
        try {
          
          await this.submitLoginPromise()
          try {
            await submitResetPasswordPromise()
          } catch (error) {
            
            Notify({
              message: error,
              duration: 1001,
            })
          }
        } catch (error) {

          Notify({
            message: 'ccc',
            duration: 1002,
          })
        }


      }).catch(error => {

        Notify({
          message: '表单校验未通过',
          duration: 1000,
        });

      })
    },
    submitLoginPromise() {

      return new Promise((resolve, reject) => {
        

        this.$http.post(this.loginRequest, {
          account: this.formData.loginName,
          password: this.formData.password
        }).then(response => {
          const code = response.code
          switch (code) {
            case 0:
              resolve(response)
            case 10001:
              reject(response)
            default:
              resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })


    },
    submitResetPasswordPromise() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.updatePasswordRequest, {
          id: this.$store.state.user.userInfo.id,
          password: this.formData.password,
          newPassword: this.formData.newPassword
        }).then(response => {
          console.log(response)
          this.dialogVisible = false
        }).catch(error => {
          console.log(error)
        })
      })

    },
  }
};

</script>

