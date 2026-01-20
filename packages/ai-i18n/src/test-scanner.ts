/**
 * 扫描器测试文件
 * 用于验证优化后的扫描器功能
 */

import { I18nScanner } from "./scanner";

// 测试用例
const testCases = [
  // 应该被扫描的
  { text: "欢迎使用", expected: true, reason: "普通中文文本" },
  { text: "床前明月光", expected: true, reason: "诗词内容" },
  { text: "请输入用户名", expected: true, reason: "提示文本" },
  { text: "操作成功", expected: true, reason: "反馈信息" },
  { text: "当前语言：中文", expected: true, reason: "界面文本" },

  // 不应该被扫描的
  { text: "世界你好_uni_app", expected: false, reason: "i18n key" },
  { text: "⚠️  文件不存在", expected: false, reason: "系统提示" },
  { text: "en-US.json 文件不存在", expected: false, reason: "技术术语" },
  { text: "currentLocale", expected: false, reason: "变量名" },
  { text: "https://example.com", expected: false, reason: "URL" },
  { text: "/api/users", expected: false, reason: "路径" },
  { text: "test@example.com", expected: false, reason: "邮箱" },
  { text: "2024-01-17", expected: false, reason: "日期" },
  { text: "123456", expected: false, reason: "纯数字" },
  { text: "const name = '测试'", expected: false, reason: "代码片段" },
];

// 运行测试
function runTests() {
  console.log("🧪 开始测试扫描器...\n");

  const scanner = new I18nScanner({
    include: [],
    exclude: [],
    debug: false, // 关闭调试模式，避免输出过多
  });

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    // 使用私有方法测试（需要类型断言）
    const result = (scanner as any).isValidText(testCase.text);
    const success = result === testCase.expected;

    if (success) {
      passed++;
      console.log(`✅ ${testCase.reason}: "${testCase.text}"`);
    } else {
      failed++;
      console.log(
        `❌ ${testCase.reason}: "${testCase.text}" (期望: ${testCase.expected}, 实际: ${result})`
      );
    }
  }

  console.log(`\n📊 测试结果:`);
  console.log(`   通过: ${passed}/${testCases.length}`);
  console.log(`   失败: ${failed}/${testCases.length}`);
  console.log(`   成功率: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n🎉 所有测试通过！");
  } else {
    console.log("\n⚠️  部分测试失败，请检查过滤规则");
  }
}

// 测试注释移除功能
function testCommentRemoval() {
  console.log("\n🧪 测试注释移除功能...\n");

  const scanner = new I18nScanner({
    include: [],
    exclude: [],
  });

  const testCode = `
    // 这是行注释
    const url = "https://example.com"; // 不应该被删除
    /* 这是块注释 */
    const message = "测试消息"; /* 注释 */
    const multiline = \`
      // 模板字符串中的注释
      /* 不应该被删除 */
    \`;
  `;

  const cleaned = (scanner as any).removeComments(testCode);

  console.log("原始代码:");
  console.log(testCode);
  console.log("\n清理后:");
  console.log(cleaned);

  // 验证
  const hasUrl = cleaned.includes("https://example.com");
  const hasComment = cleaned.includes("这是行注释");

  console.log(`\n✅ URL 保留: ${hasUrl}`);
  console.log(`❌ 注释删除: ${!hasComment}`);
}

// 测试模板扫描
function testTemplateScanning() {
  console.log("\n🧪 测试模板扫描功能...\n");

  const scanner = new I18nScanner({
    include: [],
    exclude: [],
    debug: true, // 开启调试模式
  });

  const template = `
    <template>
      <view>
        <!-- 这是注释 -->
        <text>欢迎使用</text>
        <text>{{ t("世界你好_uni_app") }}</text>
        <text>{{ currentLocale }}</text>
        <text>{{ "固定文本" }}</text>
        <input placeholder="请输入用户名" />
        <button :title="dynamicTitle">按钮</button>
        <button title="固定标题">按钮</button>
      </view>
    </template>
  `;

  const texts = (scanner as any).extractChineseFromTemplate(template);

  console.log("\n扫描结果:");
  texts.forEach((text: string) => {
    console.log(`  - "${text}"`);
  });

  console.log(`\n总计: ${texts.length} 条文本`);
}

// 运行所有测试
if (require.main === module) {
  runTests();
  testCommentRemoval();
  testTemplateScanning();
}

export { runTests, testCommentRemoval, testTemplateScanning };

