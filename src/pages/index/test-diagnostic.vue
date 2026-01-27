<template>
  <div class="diagnostic-test">
    <h1>AI 诊断插件测试</h1>

    <!-- 测试：语法错误 -->
    <button @click="handleClick">点击测试</button>

    <div>{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 测试 1: 导入不存在的模块 - 这会导致构建错误
import { someFunction } from "@/utils/non-existent-file";

const message = ref("测试消息");

// 测试 2: 语法错误 - 缺少括号
const handleClick = () => {
  console.log("clicked");
  // 缺少闭合括号，这是语法错误
};

// 测试 3: 使用不存在的导入
someFunction();
</script>

<style scoped>
.diagnostic-test {
  padding: 20px;
}

h1 {
  color: #42b983;
}

button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #35a372;
}
</style>
