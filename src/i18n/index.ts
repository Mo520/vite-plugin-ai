/**
 * i18n 国际化配置
 */

import { createI18n } from "vue-i18n";
import zhCN from "../locales/zh-CN.json";
import enUS from "../locales/en-US.json";

// 创建 i18n 实例
export const i18n = createI18n({
  locale: "zh-CN", // 默认语言
  fallbackLocale: "en-US", // 回退语言
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 全局注入 $t 函数
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

// 切换语言的辅助函数
export function setLocale(locale: string) {
  i18n.global.locale.value = locale as any;
  // 保存到本地存储
  localStorage.setItem("locale", locale);
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value;
}

// 获取支持的语言列表
export function getAvailableLocales() {
  return [
    { value: "zh-CN", label: "简体中文" },
    { value: "en-US", label: "English" },
  ];
}
