import Vue from 'vue'
import App from './App.vue'

// added by zhouquan V

import router from './router'
import store from './store'  // used by layout

import '@/icons'

import Element from 'element-ui'
// import './assets/styles/element-variables.scss'
Vue.use(Element)

// added by zhouquan ^

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
