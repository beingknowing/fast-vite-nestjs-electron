import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHashHistory(), // Electron 必须使用 Hash 模式
  routes, // 这里是自动扫描生成的路由表
})

export default router