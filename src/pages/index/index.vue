<template>
  <div class="container">
    <!-- 语言切换按钮 -->
    <div class="language-switcher">
      <button
        v-for="locale in availableLocales"
        :key="locale.value"
        :class="['lang-btn', { active: currentLocale === locale.value }]"
        @click="switchLanguage(locale.value)"
      >
        {{ locale.label }}
      </button>
    </div>

    <!-- 标题 -->
    <h1 class="title">{{ t("世界你好_uni_app") }}</h1>

    <!-- 测试按钮 -->
    <button class="test-btn" @click="handleClick">
      {{ t("点击测试是") }}
    </button>

    <!-- 跳转到性能测试页 -->
    <button class="nav-btn" @click="goToPerformancePage">
      {{ t("性能测试页") }}
    </button>

    <!-- 跳转到代码审查测试页 -->
    <button class="nav-btn" @click="goToCodeReviewTestPage">
      {{ t("代码审查测试页") }}
    </button>

    <!-- 跳转到 Mock 测试页 -->
    <button class="nav-btn" @click="goToMockTestPage">🤖 Mock API 测试</button>

    <p>{{ t("大姐你好") }}</p>
    <p>{{ t("二姐你好") }}</p>
    <!-- 当前语言显示 -->
    <p class="current-lang">
      {{
        currentLocale === "zh-CN"
          ? "当前语言：中文"
          : "Current Language: English"
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { setLocale, getLocale, getAvailableLocales } from "../../i18n";

// 使用 i18n
const { t, locale } = useI18n();

// 使用路由
const router = useRouter();

// 当前语言
const currentLocale = computed(() => locale.value);

// 可用语言列表
const availableLocales = getAvailableLocales();

// 显示提示消息
const showToast = (message: string) => {
  // 简单的提示实现，可以替换为更好的 UI 库
  alert(message);
};

// 切换语言
const switchLanguage = (lang: string) => {
  setLocale(lang);
  showToast(lang === "zh-CN" ? "语言已切换" : "Language switched");
};

// ========== 测试代码质量问题 ==========

// 问题 1: 性能问题 - 嵌套循环 O(n²) 复杂度
for (let i = 0; i < 200; i++) {
  for (let j = 0; j < 2002 * 10; j++) {
    // 空循环，浪费 CPU 资源
  }
}

// 问题 2: 内存泄漏 - 全局缓存永不清理
const globalCache: any[] = [];
const addToCache = (data: any) => {
  globalCache.push(data); // 永远不清理，导致内存泄漏
  return globalCache.length;
};

// 问题 3: 安全问题 - 使用 eval()
const executeCode = (code: string) => {
  return eval(code); // 严重安全风险！
};

// 问题 4: 性能问题 - 重复计算
const calculateExpensive = (n: number) => {
  let result = 0;
  for (let i = 0; i < n; i++) {
    // 每次循环都重复计算 Math.sqrt
    result += Math.sqrt(n) * Math.sqrt(n);
  }
  return result;
};

// 问题 5: 最佳实践 - 缺少错误处理
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`); // 没有 try-catch
  const data = await response.json(); // 没有检查 response.ok
  return data;
};

// 问题 6: 安全问题 - SQL 注入风险
const buildQuery = (userId: string) => {
  return `SELECT * FROM users WHERE id = ${userId}`; // SQL 注入风险
};

// 问题 7: 代码规范 - 魔法数字
const calculateDiscount = (price: number) => {
  if (price > 100) {
    // 魔法数字
    return price * 0.8; // 魔法数字
  }
  return price;
};

// 问题 8: 性能问题 - 不必要的对象创建
const processItems = (items: any[]) => {
  return items.map((item) => {
    return { ...item, timestamp: new Date() }; // 每次都创建新 Date
  });
};

// ========== 正常代码 ==========

// 测试按钮点击
const handleClick = () => {
  // 触发一些问题代码（仅用于测试）
  addToCache({ test: "data" });
  calculateExpensive(1000);

  showToast(t("测试成功"));
};

// 跳转到性能测试页
const goToPerformancePage = () => {
  router.push("/hosd");
};

// 跳转到代码审查测试页
const goToCodeReviewTestPage = () => {
  router.push("/code-review-test");
};

// 跳转到 Mock 测试页
const goToMockTestPage = () => {
  router.push("/mock-test");
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
  margin-bottom: 15px;
}

.test-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-btn {
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.9);
  color: #764ba2;
  border: 2px solid white;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  margin-bottom: 15px;
}

.nav-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.current-lang {
  margin-top: 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
</style>

