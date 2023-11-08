<template>
  <div id="app">
    <router-view />
    <!-- HelloWorld msg="Welcome to Your Vue.js App" /-->
  </div>
</template>

<script>
import '@/assets/styles/index.scss' // global css
import { getAllMetadata } from '@user/security_api';
import Vue from 'vue';
export default {
  name: 'App',
  components: {},
  async created() {
    const response = await getAllMetadata();
    console.log(response);
    const allMetadata = { dictionariesMap: {} };
    allMetadata.entitiesMap = response.entities.reduce((obj, item) => {
      obj[item.name] = item;
      return obj;
    }, {});

    allMetadata.dictionaries = response.dictionaries;
    for (const [key, dict] of Object.entries(response.dictionaries)) {
      var dictMap = {}
      for (var item of dict) {
        dictMap[item.value] = { label: item.label, tag: item.tag };
      }
      allMetadata.dictionariesMap[key] = dictMap;
    }

    Vue.prototype.$metadata = allMetadata;
  }
}
</script>

<style></style>
