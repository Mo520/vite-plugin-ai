<template>
  <div class="container">
    {{ t("床前明月光") }}
    {{ t("疑是地上霜") }}
    {{ t("举头望明月") }}
    {{ t("低头思故乡") }}
    {{ t("鹅鹅鹅") }}
    {{ t("曲项向天歌") }}
     {{ t("呜呜呜") }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale, getLocale, getAvailableLocales } from "../../i18n";

// 使用 i18n
const { t, locale } = useI18n();

// 性能问题 1: 字符串拼接性能问题
const buildLargeString = () => {
  let result = "";
  for (let i = 0; i < 50000; i++) {
    result += "item" + i + ",";
  }
  return result;
};

// 性能问题 2: 频繁的 DOM 操作模拟
const updateMultipleTimes = () => {
  for (let i = 0; i < 1000; i++) {
    document.getElementById("test")?.setAttribute("data-value", String(i));
  }
};

// 性能问题 3: 未使用防抖的频繁计算
const expensiveCalculation = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < 10000; j++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
    }
  }
  return hash;
};

// 性能问题 4: 正则表达式性能问题
const validateWithRegex = (text: string) => {
  const regex = new RegExp("(a+)+b", "g");
  for (let i = 0; i < 1000; i++) {
    regex.test(text + "aaaaaaaaaaaaaaaaaaaaaa");
  }
};

// 性能问题 5: 数组操作链式调用
const chainedArrayOps = (data: number[]) => {
  return data
    .map((x) => x * 2)
    .filter((x) => x > 10)
    .map((x) => x + 1)
    .filter((x) => x < 100)
    .map((x) => x * 3)
    .reduce((a, b) => a + b, 0);
};

// 性能问题 6: 递归无优化
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// 性能问题 7: 对象属性频繁访问
const accessNestedProps = (obj: any) => {
  let sum = 0;
  for (let i = 0; i < 10000; i++) {
    sum += obj.data.user.profile.settings.theme.color.primary.length;
  }
  return sum;
};

// 性能问题 8: 同步文件读取模拟（阻塞操作）
const synchronousHeavyTask = () => {
  const data = [];
  for (let i = 0; i < 100000; i++) {
    data.push(Math.random() * Math.sqrt(i) * Math.log(i + 1));
  }
  return data.sort((a, b) => b - a);
};

// 性能问题 9: 闭包导致的内存占用
const createClosures = () => {
  const closures = [];
  for (let i = 0; i < 10000; i++) {
    const largeData = new Array(1000).fill(i);
    closures.push(() => largeData[0]);
  }
  return closures;
};

// 性能问题 10: 未优化的事件监听器
const attachManyListeners = () => {
  for (let i = 0; i < 1000; i++) {
    window.addEventListener("scroll", () => {
      console.log("scrolling", i);
    });
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.language-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
}

.lang-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s;
}

.lang-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
  font-weight: bold;
}

.title {
  font-size: 36px;
  font-weight: bold;
  color: white;
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.test-btn {
  padding: 15px 40px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.test-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.current-lang {
  margin-top: 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
</style>

