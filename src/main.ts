import { createApp } from "vue";
import App from "./App.vue";
import { i18n } from "./i18n";
import router from "./router";
import "./style.css";

const app = createApp(App);

// 注册 i18n
app.use(i18n);

// 注册路由
app.use(router);

app.mount("#app");
