<script setup lang="ts">
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()



// 动态从路由中生成 navLinks，过滤掉重定向路由（如 '/'），并根据 meta.order 排序
// 使用路由名称作为 key 以确保稳定的组件更新
const navLinks = computed(() => {
  return router.getRoutes()
    .filter(r => r.path !== '/' && r.meta?.label)
    .map(r => ({
      to: r.path,
      meta: r.meta
    }))
    .sort((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0))
})
</script>

<template>
<div class="app-shell">
  <aside class="nav-panel">
    <div class="nav-brand">
      <p class="eyebrow">Quick Ticket to Queue</p>
      <h1>工单控制台</h1>
      <p class="nav-subtitle">常用队列、凭据配置与工单提交入口</p>
    </div>
    <nav class="nav-links">
      <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link"
        :class="{ 'is-active': route.path.startsWith(link.to) }">
        <span class="nav-link__label">{{ link.meta.label }}</span>
        <span class="nav-link__desc">{{ link.meta.description }}</span>
      </RouterLink>
    </nav>
  </aside>

  <section class="display-panel">
    <div class="display-body">
      <RouterView v-slot="{ Component }">
        <component v-if="Component" :is="Component" class="display-component" />
        <div v-else class="empty-state">
          <h3>欢迎使用 Quick Ticket to Queue</h3>
          <p>请选择左侧功能开始提交工单或维护配置。</p>
        </div>
      </RouterView>
    </div>
  </section>
</div>
</template>

<style scoped>
:global(html, body, #app) {
  font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
  background: #050915;
  color: #e2e8f0;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 98vh;
  width: 99vw;
}

.nav-panel {
  background: linear-gradient(180deg, #0f172a 0%, #111827 70%);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);

}

.nav-brand h1 {
  margin: 8px 0 4px;
  font-size: 24px;
  color: #ffffff;
}

.nav-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  color: #94a3b8;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.nav-link {
  border-radius: 16px;
  padding: 16px;
  text-decoration: none;
  color: #d9e3ff;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
}

.nav-link__label {
  font-weight: 600;
  font-size: 15px;
}

.nav-link__desc {
  font-size: 12px;
  color: #94a3b8;
}

.nav-link:hover {
  transform: translateX(4px);
  border-color: rgba(56, 189, 248, 0.7);
}

.nav-link.is-active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  box-shadow: 0 15px 40px rgba(8, 47, 73, 0.45);
}

.display-panel {
  background: #f5f7fb;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.display-header {
  background: #ffffff;
  padding: 3px;
  border-radius: 18px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.1);
  color: #0f172a;
}

.display-header .lede {
  margin-top: 8px;
  color: #475569;
}

.display-body {
  flex: 1;
  background: #ffffff;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  min-height: 0;
}

.display-component {
  height: 100%;
}

.empty-state {
  text-align: center;
  color: #475569;
  padding: 96px 24px;
}

.empty-state h3 {
  margin-bottom: 12px;
  color: #0f172a;
  font-size: 24px;
}

@media (max-width: 960px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .nav-panel {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>