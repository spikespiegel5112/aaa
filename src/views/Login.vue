<template>
  <div class="access_login_container">
    <div v-if='reloadFlag'></div>
    <div v-else>
      <div class="bg">
        <div class="header">
          <div class="logo">
            <img src="@/image/common/logo_00000.jpg" alt="">
          </div>
        </div>
        <div class="main">
          <div class="banner">
            <img src="@/image/access/login_bg2_00000.png" alt />
          </div>
          <div class="logo">
            <!-- <img src="@/image/common/logo.png" alt=""> -->
            <h1>Welcome To SYSTEM</h1>
          </div>
        </div>
        <div class="footer">
          <!-- <p class="slogan">For A Better Digital Solution</p> -->
          <span class="copyright">Copyright @2020</span>
        </div>
      </div>
      <div class="main">
        <div class="login_wrapper">
          <el-form ref="formData" :model="formData" :rules="loginRules" class="loginform">
            <h3 class="title">登录</h3>
            <el-form-item prop="loginName">
              <el-input v-model="formData.loginName" type="text" auto-complete="off" placeholder="Username">
                <img class="icon" slot="prefix" src="@/image/access/username.png" alt />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="formData.password" type="password" auto-complete="off" placeholder="Password"
                @keyup.enter.native="handleLogin">
                <img class="icon" slot="prefix" src="@/image/access/password.png" alt />
              </el-input>
            </el-form-item>
            <el-form-item class="operation">
              <el-button :loading="loading" size="medium" type="primary" @click.native.prevent="handleLogin">
                <span v-if="!loading">Login</span>
                <span v-else>Logging in...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!--  底部  -->
  </div>
</template>

<script>

export default {
  name: "Login",
  data() {
    return {
      loginRequest: '/login',
      codeUrl: "",
      cookiePassword: "",
      verificationCodeData: '',
      formData: {
        loginName: "admin",
        password: "123456"
      },
      rememberMe: false,

      loginRules: {
        loginName: [{
          required: true,
          trigger: "blur",
          message: "用户名不能为空"
        }],
        password: [{
          required: true,
          trigger: "blur",
          message: "密码不能为空"
        }],
        imageCode: [{
          required: true,
          trigger: "change",
          message: "验证码不能为空"
        }]
      },
      loading: true,
      reloadFlag: true,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  beforeCreate() {

  },
  created() {
    this.checkIfNeedReload()

    this.$remResizing({
      baseline: 1366,
      fontSize: 20
    })

  },
  async mounted() {
    this.loading = true;

    const authFlag = localStorage.getItem("loginFlag");
    const backRoute = this.$store.state.app.backRoute

    if (authFlag && authFlag !== 'null') {

      this.$router.push('/dashboard')
      this.loading = false;
    } else {
      this.loading = false;
    }
  },
  methods: {
    checkIfNeedReload() {


      if (this.$route.query.action === 'reload') {
        var url = window.location.href;                    //获取当前页面的url
        if (url.indexOf("?") != -1) {                        //判断是否存在参数
          url = url.replace(/(\?|#)[^'"]*/, '');           //去除参数
          window.history.pushState({}, 0, url);
        }
        // this.$router.push({
        //   path: '/dashboard'
        // });
      } else {
        this.reloadFlag = false
      }
    },
    handleLogin() {
      this.$refs.formData.validate(async valid => {

        if (valid) {
          this.loading = true;


          try {
            // await this.$store.dispatch("Login", this.formData)
            await this.submitLogin(this.formData)
            localStorage.setItem("loginFlag", true);
            this.$store.commit('setLogin', true)
            this.$message.success('登录成功')
            let href = location.href.replace(/(\?|#)[^'"]*/, '');
            href = location.href + '?action=reload'
            window.location.href = href
            location.reload()
            this.loading = false;
          } catch (error) {
            console.log(error)
            this.loading = false;
            this.$message.error(error)

          }
        }
      });
    },
    submitLogin(formData) {
      return new Promise((resolve, reject) => {

        // // 临时跳过登录
        // resolve()
        // return

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
    
  }
};

</script>

