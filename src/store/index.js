import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import getters from './getters'
import settings from './modules/settings'
import user from './modules/user'
import tagsView from './modules/tagsView'
import routers from './modules/router'
/*
import permission from './modules/permission'
import dict from './modules/dict'
*/

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    tagsView,
    routers,
    /*
    permission,
    dict
    */
  },
  getters
})

export default store
