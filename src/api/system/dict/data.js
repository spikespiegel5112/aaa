import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/dictType/' + dictType,
    method: 'get'
  })
}

// 添加字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}

// 导出字典数据
export function exportData(query) {
  return request({
    url: '/system/dict/data/export',
    method: 'get',
    params: query
  })
}

/**
 * 查找字典值
 * @param { String } params - code值
 */
export function dictSelect(code){
  return request({
    url: `/api/dictItem/select/${code}`,
    method: 'get'
  });
}

/**
 * 查找第三方字典值
 * @param { String } params - code值
 */
export function dictThirdPartySelect(category){
  return request({
    url: '/api/thirdParty/findDict',
    params: {
      category
    },
    method: 'get'
  });
}
