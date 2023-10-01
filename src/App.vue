<template>
  <div id="app">
    <router-view />
    <!-- HelloWorld msg="Welcome to Your Vue.js App" /-->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import '@/assets/styles/index.scss' // global css

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style></style>
