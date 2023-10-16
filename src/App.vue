<template>
  <div id="app" style="margin:10px">
    <router-view />
    <!-- HelloWorld msg="Welcome to Your Vue.js App" /-->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import '@/assets/styles/index.scss' // global css
import store from './store';

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  created() {
    store.dispatch('ProcessMenus').then(routes => {
      // 根据roles权限生成可访问的路由表
      this.$router.addRoutes(routes) // 动态添加可访问路由表
    });
  }
}
</script>

<style></style>
