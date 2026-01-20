import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/pages/index/index.vue"),
    },
    {
      path: "/hosd",
      name: "PerfTest",
      component: () => import("@/pages/hosd/index.vue"),
    },
    {
      path: "/code-review-test",
      name: "CodeReviewTest",
      component: () => import("@/pages/code-review-test/index.vue"),
    },
    {
      path: "/mock-test",
      name: "MockTest",
      component: () => import("@/pages/mock-test/index.vue"),
    },
  ],
});

export default router;
