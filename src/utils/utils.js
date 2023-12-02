import _request from '@/utils/request'
import store from '@/store'
import { getAccessToken } from '@/utils/auth'

// 也可以使用lodash _.get(project,'a.b')， 已放入vue

export function safeGet(o, path) {
  return path.split('.').reduce((o = {}, b) => o[b], o);
}

export function getManyItemLabel(item, fieldMeta) {
  const fields = fieldMeta.refData.split(',');
  return safeGet(item, fields[1]);
}

export function check(condition, message) {
  if (!condition) throw new Error(message);
}

export const globalDateFormat = 'yyyy-MM-dd';
export const globalDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

// TODO apis not used
export async function initMetadata(object, apis, name) {
  if (name) {
    const ret_metadata = object.$metadata.entitiesMap[name];
    check(ret_metadata != null, `can't find ${name}`)
    ret_metadata.searchFields = ret_metadata.fields.filter(field => field.searchable);
    ret_metadata.fields.forEach(field => {
      if (!field.nullable && !field.hidden) _addRule(object, field.name, { required: true, message: `请输入'${field.label}'`, trigger: 'blur' });
    });
    object.metadata = ret_metadata;
    const componentName = object.$options.name
    console.log(`${componentName}.${name} Entity: `, object.metadata);
    console.log(`${componentName}.${name} Rules: `, object.rules);
  }
  object.dictionaries = object.$metadata.dictionaries;
  if (object.dictionariesMap) {
    object.dictionariesMap = object.$metadata.dictionariesMap;
  }
}

function _addRule(object, name, rule) {
  if (!object.rules) return;
  if (!object.rules[name])
    object.rules[name] = [];
  object.rules[name].push(rule);
}

export const defaultCrudActions = [
  {
    desc: "修改",
    method: 'showEditDialog',
  },
  {
    desc: '删除',
    method: 'showDeleteConfirm',
  }
];

export const defaultActionProc = function (action) {
  let crud = this.$refs.crud; //TODO how about ref other than crud?
  if (this[action.name]) {
    this[action.name](...action.params);
  }
  else
    crud[action.name](...action.params);
};


export function getCurrentUser() {
  return store.state.user;
}

//树形结构需要每行有一个id，且还只能是固定的名字
const mappingId = (idField, result) => {
  if (!idField || !result) return;
  if (Array.isArray(result)) {
    result.forEach(item => mappingId(idField, item));
  }
  else {
    result.id = result[idField];
    if (result.children) mappingId(idField, result.children);
  }
}

import Element from 'element-ui';
export function globalErrorHandler(err, vm, info) {
  if (err._handled) return;
  err._handled = true;
  console.error('*** Error:', err, vm, info);
  Element.Message({
    dangerouslyUseHTMLString: true,
    message: `${err.name} - ${err.code} - ${err.message} <br/><br/> ${err?.response?.data.errCode} ${err?.response?.data.message}`,
    type: 'error',
    duration: 0,
    showClose: true,
    center: true
  });
}

export function request(options) {
  const resetFlag = (obj, loading) => { if (obj && loading) obj[loading] = false };
  // common request handler
  if (options.This && options.loading) options.This[options.loading] = true;
  return _request({ baseURL: process.env.VUE_APP_BASE_API, ...options }).then(response => {
    // common response handler
    resetFlag(options.This, options.loading);
    mappingId(options.idField, response.result);
    return response.result;
  }).catch(error => {
    // common exception handler
    resetFlag(options.This, options.loading);
    if (!options.noPopup)
      globalErrorHandler(error);
    throw error;
  });
}

export function getAuthHeader() {
  return { 'Authorization': 'Bearer ' + getAccessToken() };
}

export function hasPermission(permission) {
  var allPermissions = store.getters && store.getters.permissions;
  //console.log(">>>>>"+allPermissions,permission,allPermissions.indexOf(permission));
  return allPermissions.indexOf(permission) >= 0;
}

export function trimProcess(object) {
  Object.keys(object).map(field => {
    if (object[field] && typeof (object[field]) == 'string') {
      object[field] = object[field].trim();
    }
  });
  return object;
}

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

export function moneyFormatter(x, y, value) {
  return value ? value.toFixed(2) : '';
}

export function dateFormatter(x, y, value, meta) {
  return meta.type == 'Date' ? value?.substring(0, 10) : value;
}

//TODO is really formatter?
export function booleanFormatter(value) {
  return value ? "是" : "否";
}

export function dictFormatter(type, value) {
  return this.dictionariesMap[type][value];
}

export function startTime(d, days = 0) {
  const newDate = new Date(d);
  // console.log(d);
  newDate.setDate(d.getDate() + days);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function notImplemented(vue) {
  vue.$message('NOT IMPLEMENTED !');
}

import Vue from 'vue';
Vue.prototype.$success = function (msg) {
  this.$notify({
    title: '成功',
    message: msg,
    type: 'success'
  });
};
