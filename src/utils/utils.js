import _request from '@/utils/request'
import store from '@/store'
// import { routes } from './router'

/* 使用lodash _.get(project,'undertaker.departmentLead')， 已放入vue
export function safeGet(o, path){
   return path.split('.').reduce((o={},b)=>o[b],0);
}
//TODO safeSet
*/

export async function initMetadata(object, apis, name) {
  const metadata = await getResult(apis.getMetadata());
  metadata.entitiesMap = metadata.entities.reduce((obj, item) => {
    obj[item.name] = item;
    return obj;
  }, {});
  const ret_metadata = metadata.entitiesMap[name];
  ret_metadata.searchFields = ret_metadata.fields.filter(field => field.searchable);
  ret_metadata.fields.forEach(field => {
    if (!field.nullable && !field.hidden) _addRule(object, field.name, { required: true, message: `请输入'${field.label}'`, trigger: 'blur' });
  });
  object.metadata = ret_metadata;

  object.dictionaries = metadata.dictionaries;
  if (object.dictionariesMap) {
    for (const [key, dict] of Object.entries(metadata.dictionaries)) {
      var dictMap = {}
      for (var item of dict) {
        dictMap[item.value] = item.label;
      }
      object.dictionariesMap[key] = dictMap;
    }
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

export function getCurrentUser() {
  return store.state.user;
}

export function request(options) {
  return _request({
    baseURL: process.env.VUE_APP_BASE_API,
    ...options,
  });
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

//get records and reset loading flag
export async function getResult(promise, loading, idField) {
  const resetFlag = (obj, loading) => { if (obj && loading) obj[loading] = false };
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
  };
  const This = this;
  if (this && loading) this[loading] = true;
  return promise.then((x) => { resetFlag(This, loading); var data = x.result; mappingId(idField, data); return data; }, (e) => { resetFlag(This, loading); throw e; }); //.then(resp => resp.data.result);
}

export function moneyFormatter(x, y, value) {
  return value ? value.toFixed(2) : '';
}

export function booleanFormatter(value) {
  return value ? "是" : "否";
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
Vue.prototype.getResult = getResult;
// Vue.prototype.getDictLabel = getDictLabel;
