<script setup lang="ts">
// Vue 3 标准生命周期
import { onMounted } from "vue";

onMounted(() => {
  console.log("App Mounted");
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 全局样式 */
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
