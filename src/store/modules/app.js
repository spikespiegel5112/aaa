import Cookies from 'js-cookie'
import request from '../../utils/request'

const state = {
  backRoute: '',
  sidebar: {
    opened: true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  currentEditingResourceCode: '',
  orderStatusDictionary: [{
    title: '待支付',
    value: 1
  }, {
    title: '支付成功',
    value: 2
  }, {
    title: '支付失败',
    value: 3
  }, {
    title: '作废',
    value: 4
  }, {
    title: '退款',
    value: 5
  }, {
    title: '撤销',
    value: 6
  }],
  accountStatusDictionary: [{
    title: '全部',
    value: ''
  }, {
    title: '正常',
    value: '1'
  }, {
    title: '冻结',
    value: '0'
  }],
  dictionary: [],
  qrCodeData: '',
  currentMerchantData: null,
  currentRouteData: null,
  pollingCheckOrderStatusTimesLimit: 25,
  headerData: {
    close: false,
    returnTo: ''
  },
  timestamp: '',
  fromRoute: ''
}

const mutations = {
  updateFromRoute: (state, payload) => {
    state.fromRoute = payload
    console.log('updateFromRoute++++', payload)
  },
  updateTimestamp: (state, payload) => {
    state.timestamp = payload
  },
  setQrCode: (state, payload) => {
    state.qrCodeData = payload
  },
  setCurrentMerchantData: (state, payload) => {
    state.currentMerchantData = payload

  },
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  updateBackRoute: (state, payload) => {
    state.backRoute = payload
  },
  updateEditingResourceCode: (state, payload) => {
    state.currentEditingResourceCode = payload
  },
  updateDictionary: (state, payload) => {
    state.dictionary.push({
      type: payload.type,
      data: payload.data
    })
  },
  updateCurrentRouteData(state, payload) {
    state.currentRouteData = payload
  },
  updateHeader(state, payload) {
    const options = {
      close: false,
      returnTo: ''
    }
    if (Object.keys(payload).length > 0) {
      state.headerData = Object.assign(options, payload)
    }
  }
}

const actions = {
  toggleSideBar({
    commit
  }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({
    commit
  }, {
    withoutAnimation
  }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({
    commit
  }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({
    commit
  }, size) {
    commit('SET_SIZE', size)
  },
  async getDictionaryThirdParty({
    commit, state
  }, dictionaryType) {
    // 2 物料分类
    const getDictionaryPromise = dictionaryType => {
      return new Promise((resolve, reject) => {
        request.get('/api/thirdParty/findDict', {
          params: {
            category: dictionaryType
          }
        }).then(response => {
          console.log('/api/thirdParty/findDict', response)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    }
    let result = state.dictionary.find(item => item.type === dictionaryType)
    if (!result) {
      try {
        result = await getDictionaryPromise(dictionaryType)
        commit('updateDictionary', {
          type: dictionaryType,
          data: result
        })
      } catch (error) {
        result = []
      }
    }
    return result
  },
  async getDictionary({
    commit, state
  }, dictionaryType) {
    // 2 物料分类
    const getDictionaryPromise = dictionaryType => {
      return new Promise((resolve, reject) => {
        request.get('/api/dictItem/select/' + dictionaryType, {
          params: {}
        }).then(response => {
          console.log('/api/dictItem/select/{code}', response)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    }
    let result = state.dictionary.find(item => item.type === dictionaryType)
    if (!result) {
      try {
        result = await getDictionaryPromise(dictionaryType)
        commit('updateDictionary', {
          type: dictionaryType,
          data: result
        })
      } catch (error) {
        result = []
      }
    }
    return result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
