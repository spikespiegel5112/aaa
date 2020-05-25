import service from '@/utils/request'
import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'
import {
  // Notification,
  // MessageBox,
  Message
} from 'element-ui'
const user = {
  state: {
    userInfo: {},
    token: getToken(),
    name: 'innben',
    avatar: '',
    // roles: ["admin"],
    roles: [],
    permissions: ["*:*:*"],
    login: true
  },

  mutations: {
    setUserInfo: (state, data) => {
      // state.token = token
      state.userInfo = data
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    setLogin: (state, payload) => {
      state.login = payload
    }
  },

  actions: {
    // 登录
    Login({
      commit,
      dispatch
    }, userInfo) {
      return new Promise((resolve, reject) => {

        console.log(userInfo)
        // 临时跳过登录
        resolve()
        return


        service.post('/api/login', {
          "imageCode": userInfo.imageCode,
          "loginName": userInfo.loginName.trim(),
          "password": userInfo.password,
          "sessionUUID": userInfo.sessionUUID
        }).then(response => {
          // setToken(response.token)
          // commit('SET_TOKEN', response.token)
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

    // 获取用户信息
    getUserInfo({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        // 临时跳过登录

        service.get('/getUserInfo', {}).then(response => {
          // response = response.data
          response = response.data || response
          commit('setUserInfo', response)
          commit('setLogin', true)
          resolve(response)
        }).catch(error => {
          reject(error)
        })

      })
    },

    // 退出系统
    logout({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        service.post('/logout', {}).then(response => {
          localStorage.removeItem('loginFlag')
          commit('setUserInfo', {})
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
