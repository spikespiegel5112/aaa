<template>
  <div class="innerlayoutmobile">
    <div class="header">
      <div class="logo">
        <img src="@/image/common/logo.png" alt="">
      </div>
      <div v-if='headerData.close' class="close">
        <van-icon name="cross" @click='close' />
      </div>
      <div class="logout">
        <a @click='logout'>注销</a>
      </div>
    </div>
    <div class="main">
      <router-view />
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
import { Col, Dialog, Row, Icon, Form, Field, Button, Toast, NavBar, Cell, CellGroup, Step, Steps, RadioGroup, Radio, ActionSheet, DropdownMenu, DropdownItem, Notify, Popup } from 'vant';


import 'vant/lib/button/style';

export default {
  name: "MobileLayout",
  components: {
    Col, Dialog, Row, Icon, Form, Field, Button, Toast, NavBar, Cell, CellGroup, Step, Steps, RadioGroup, Radio, ActionSheet, DropdownMenu, DropdownItem, Notify, Popup
  },
  data() {
    return {
      getUserInfoRequest: '/getUserInfo'
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    },
    headerData() {
      return this.$store.state.app.headerData
    }
  },
  watch: {

  },
  created() {
    this.$remResizing({
      baseline: 320,
      fontSize: 20,
      threshold: 640,

    })
    this.importVantComponents()

  },
  mounted() {
  },
  methods: {
    importVantComponents() {
      Vue.use(Col);
      Vue.use(Dialog);
      Vue.use(Row);
      Vue.use(Form);
      Vue.use(Icon);
      Vue.use(Field);
      Vue.use(Button);
      Vue.use(Toast);
      Vue.use(NavBar);
      Vue.use(Cell);
      Vue.use(CellGroup);
      Vue.use(Step);
      Vue.use(Steps);
      Vue.use(RadioGroup);
      Vue.use(Radio);
      Vue.use(ActionSheet);
      Vue.use(DropdownMenu);
      Vue.use(DropdownItem);
      Vue.use(Notify);
      Vue.use(Popup);


    },

    close() {
      const returnTo = this.headerData.returnTo
      this.$store.commit('app/updateHeader', {
        close: false,
        returnTo: ''
      })
      this.$router.push({
        name: returnTo
      })
    },
    logout() {
      this.$dialog.confirm({
        title: '提示',
        message: '是否注销当前账户？',
      }).then(() => {
        localStorage.removeItem("loginFlag");
        this.$store.dispatch('logout').then(response => {
          this.$router.push({
            path: '/loginMobile'
          })
        })
      })


    }
  }
};

</script>

<style lang='scss'>
// @import "../sassmobile/ordermobile.scss";
</style>
 

