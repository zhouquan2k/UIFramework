import Vue from 'vue'
import App from './App.vue'

// added by zhouquan V

import store from './store'  // used by layout
import directive from './directive' // directive
Vue.use(directive);

import '@/icons';

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// import './assets/styles/element-variables.scss'
Vue.use(Element, {
  size: 'small' // set element-ui default size
});

//global error handler
Vue.config.errorHandler = function (err, vm, info) {
  Element.Message({
    dangerouslyUseHTMLString: true,
    message: `${err.name} - ${err.code} - ${err.message} <br/><br/> ${err?.response?.data.errCode} ${err?.response?.data.message}`,
    type: 'error',
    duration: 0,
    showClose: true,
    center: true
  });
}

// route related
import Router from 'vue-router'
Vue.use(Router);
import { initRouter } from './router';
const allRoutes = initRouter();
const router = new Router({
  base: process.env.VUE_APP_APP_NAME ? process.env.VUE_APP_APP_NAME : "/",
  mode: 'history', // 去掉url中的#
  scrollBehavior: () => ({ y: 0 }),
  routes: allRoutes
});

// added by zhouquan ^


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
