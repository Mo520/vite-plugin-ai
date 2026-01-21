<template>
  <div class="build-error-test">
    <h1>构建错误测试</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 导入不存在的模块 - 这会导致构建错误
import { nonExistentFunction } from "./non-existent-module";

const message = ref("测试构建错误");

// 使用不存在的函数
nonExistentFunction();
</script>

<style scoped>
.build-error-test {
  padding: 20px;
}
</style>
