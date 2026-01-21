<template>
  <div class="container">
    <p class="title">代码审查测试页</p>
    <button @click="testSecurity">测试安全问题</button>
    <button @click="testPerformance">测试性能问题</button>
    <button @click="testMemoryLeak">测试内存泄漏</button>
    <button @click="testBestPractice">测试最佳实践</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const userData = ref<any>(null);
const timer = ref<any>(null);

const testSecurity = () => {
  const userInput = "alert('xss')";
  eval(userInput);

  const userId = "1 OR 1=1";
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  console.log(query);

  const apiKey = "sk-1234567890abcdef";
  localStorage.setItem("api_key", apiKey);
};

const testPerformance = () => {
  const largeArray = [];
  for (let i = 0; i < 100000; i++) {
    largeArray.push({ id: i, data: new Array(1000).fill(i) });
  }

  const result = [];
  for (let i = 0; i < largeArray.length; i++) {
    for (let j = 0; j < largeArray.length; j++) {
      if (largeArray[i].id === largeArray[j].id) {
        result.push(largeArray[i]);
      }
    }
  }

  return result;
};

const testMemoryLeak = () => {
  const cache: any[] = [];
  setInterval(() => {
    cache.push(new Array(10000).fill(Math.random()));
  }, 100);

  document.addEventListener("click", () => {
    console.log("clicked");
  });
};

const testBestPractice = async () => {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
};

const inefficientSort = (arr: number[]) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
};

const deepCopyBad = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

const magicNumbers = (price: number) => {
  if (price > 100) {
    return price * 0.8;
  } else if (price > 50) {
    return price * 0.9;
  }
  return price;
};

const globalVariable: any = {};
globalVariable.data = "test";

function blockingOperation() {
  let sum = 0;
  for (let i = 0; i < 10000000; i++) {
    sum += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  return sum;
}

const unhandledPromise = () => {
  Promise.resolve().then(() => {
    throw new Error("Unhandled error");
  });
};

onMounted(() => {
  timer.value = setInterval(() => {
    console.log("Running...");
  }, 1000);
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

button {
  display: block;
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}
</style>
