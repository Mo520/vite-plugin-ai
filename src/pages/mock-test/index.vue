<template>
  <div class="container">
    <div class="header">
      <p class="title">🤖 AI Mock Generator 测试</p>
      <button class="back-btn" @click="goBack">返回</button>
    </div>

    <!-- 测试按钮组 -->
    <div class="test-section">
      <p class="section-title">📡 API 测试</p>

      <button class="test-btn" @click="testUserList">获取用户列表</button>

      <button class="test-btn" @click="testUserDetail">获取用户详情</button>

      <button class="test-btn" @click="testProductList">获取商品列表</button>

      <button class="test-btn" @click="testPagination">测试分页</button>

      <button class="test-btn" @click="testFilter">测试过滤</button>

      <button class="test-btn" @click="testSort">测试排序</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <!-- 结果显示 -->
    <div v-if="result" class="result-section">
      <div class="result-header">
        <p class="section-title">📊 响应结果</p>
        <button class="clear-btn" @click="clearResult">清空</button>
      </div>

      <div class="result-info">
        <p class="info-item">状态码: {{ result.code }}</p>
        <p class="info-item">消息: {{ result.message }}</p>
        <p class="info-item">数据量: {{ getDataCount(result.data) }}</p>
      </div>

      <div class="result-content">
        <p class="result-text">{{ formatJSON(result) }}</p>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error-section">
      <p class="error-title">❌ 错误</p>
      <p class="error-text">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

// 使用路由
const router = useRouter();

// 状态
const loading = ref(false);
const result = ref<any>(null);
const error = ref("");

// 显示提示消息
const showToast = (message: string, isError = false) => {
  // 简单的提示实现，可以替换为更好的 UI 库
  alert(message);
};

// 返回首页
const goBack = () => {
  router.back();
};

// 清空结果
const clearResult = () => {
  result.value = null;
  error.value = "";
};

// 获取数据数量
const getDataCount = (data: any): number => {
  if (Array.isArray(data)) {
    return data.length;
  }
  if (data && typeof data === "object") {
    if (data.list && Array.isArray(data.list)) {
      return data.list.length;
    }
    return 1;
  }
  return 0;
};

// 格式化 JSON
const formatJSON = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

// 通用请求函数
const fetchAPI = async (url: string, options?: RequestInit) => {
  loading.value = true;
  error.value = "";
  result.value = null;

  try {
    console.log("🚀 发起请求:", url);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log("📥 响应状态:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ 响应数据:", data);

    result.value = data;

    showToast("请求成功");
  } catch (err: any) {
    console.error("❌ 请求失败:", err);
    error.value = err.message || "请求失败";

    showToast("请求失败", true);
  } finally {
    loading.value = false;
  }
};

// 测试 1: 获取用户列表
const testUserList = () => {
  fetchAPI("/api/users");
};

// 测试 2: 获取用户详情
const testUserDetail = () => {
  fetchAPI("/api/users/123");
};

// 测试 3: 获取商品列表
const testProductList = () => {
  fetchAPI("/api/products");
};

// 测试 4: 测试分页
const testPagination = () => {
  fetchAPI("/api/users?page=1&pageSize=5");
};

// 测试 5: 测试过滤
const testFilter = () => {
  const filter = JSON.stringify({ role: "admin" });
  fetchAPI(`/api/users?filter=${encodeURIComponent(filter)}`);
};

// 测试 6: 测试排序
const testSort = () => {
  fetchAPI("/api/users?sort=age");
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.back-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 14px;
}

.test-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.test-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.test-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  margin-bottom: 20px;
}

.loading text {
  font-size: 16px;
  color: #667eea;
}

.result-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.clear-btn {
  padding: 6px 15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 12px;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-item {
  font-size: 14px;
  color: #666;
}

.result-content {
  max-height: 400px;
  background: #2d3748;
  border-radius: 10px;
  padding: 15px;
}

.result-text {
  font-size: 12px;
  color: #a0aec0;
  font-family: "Courier New", monospace;
  line-height: 1.6;
  word-break: break-all;
}

.error-section {
  background: rgba(255, 107, 107, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  display: block;
}

.error-text {
  font-size: 14px;
  color: white;
  line-height: 1.6;
}
</style>
