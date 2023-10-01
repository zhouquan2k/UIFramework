import Vue from 'vue'
import App from './App.vue'

// added by zhouquan V

import router from './router'
import store from './store'  // used by layout

import '@/icons'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// import './assets/styles/element-variables.scss'
Vue.use(Element, {
  size: 'small' // set element-ui default size
});

// added by zhouquan ^

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
