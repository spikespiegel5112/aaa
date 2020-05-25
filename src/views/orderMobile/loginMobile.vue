<template>
  <div class="login">
    <!-- <van-nav-bar title="登录" /> -->
    <div class="">
      <van-form validate-first label-width="3rem">
        <!-- 通过 pattern 进行正则校验 -->
        <van-field class="border" v-model="formData.account" name="account" placeholder="账号"
          :rules="[{ required: true, message: '请输入账号' }]" label="账号：" />
        <!-- 通过 validator 进行函数校验 -->
        <van-field class="border" v-model="formData.password" type="password" name="validator" placeholder="密码"
          :rules="[{ required: true, message: '请输入密码' }]" label="密码：" />
        <!-- 通过 validator 进行异步函数校验 -->

        <div class="forgetpassword">
          <ul>
            <li>
              <a @click='handleForgetPassword'>忘记密码</a>
            </li>
            <li>
              <router-link :to="{name:'changePassword'}">修改密码</router-link>
            </li>
          </ul>
        </div>
        <div style="margin: 16px;">
          <van-button round block type="info" @click='handleSubmit'>登录 </van-button>
        </div>
      </van-form>
    </div>
    <div class="bg">
      <img src="@/image/mobile/bg.png" alt="">
    </div>
    <van-popup v-model="dialogVisible" round :close-on-click-overlay='false' overlay-class='common_dialog_container'>
      <div class="common_dialog_wrapper">
        <div class="main">
          <div class="content">
            请联系管理员
          </div>
        </div>
        <div class="footer">
          <a class="button" @click='dialogVisible=false'>确认</a>
        </div>
      </div>
    </van-popup>
  </div>

</template>

<script>
import { Notify } from 'vant';


export default {
  name: "LoginMobile",
  components: {
  },
  data() {
    return {
      loginRequest: '/login',
      formData: {
        account: "admin",
        password: "123456"
      },
      value1: '',
      value2: '',
      value3: '',
      pattern: /\d{6}/,
      dialogVisible: false
    };
  },
  watch: {

  },
  created() {

  },
  async mounted() {

    const authFlag = localStorage.getItem("loginFlag");

    if (authFlag && authFlag !== 'null') {
      this.$router.push('/createOrderMobile')
      this.loading = false;
    } else {
      this.loading = false;
    }
  },
  methods: {
    // 校验函数返回 true 表示校验通过，false 表示不通过
    validator(val) {
      return /1\d{10}/.test(val);
    },
    // 异步校验函数返回 Promise
    asyncValidator(val) {
      return new Promise((resolve) => {
        this.$toast.loading('验证中...');;

        setTimeout(() => {
          this.$toast.clear();
          resolve(/\d{6}/.test(val));
        }, 1000);
      });
    },
    onFailed(errorInfo) {
      console.log('failed', errorInfo);
    },
    async  handleSubmit() {
      try {
        await this.submitLoginPromise()
        localStorage.setItem("loginFlag", true);
        this.$store.commit('setLogin', true)

        Notify({
          type: 'success',
          message: '登录成功',
          duration: 1000
        })
        this.$router.push({
          name: 'createOrderMobile'
        })
      } catch (error) {
        Notify({
          message: error,
          duration: 1000
        })
      }
    },
    submitLoginPromise(formData) {
      return new Promise((resolve, reject) => {
        this.$http.post(this.loginRequest, {
          account: this.formData.account,
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
    handleForgetPassword() {
      this.dialogVisible = true
    }
  }
};

</script>

