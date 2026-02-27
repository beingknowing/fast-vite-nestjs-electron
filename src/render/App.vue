<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'

type NavLink = { label: string; to: string; description: string }

const navLinks: NavLink[] = [
  { label: '工单中心', to: '/ticket/ticket', description: '创建并提交新的 ServiceNow 工单' },
  { label: '凭据管理', to: '/settings/credentials', description: '维护 Client ID、Secret 与主机地址' },
  { label: '路由示例 · 一', to: '/routeTest/viewOne', description: '演示自动路由 ViewOne 页面' },
  { label: '路由示例 · 二', to: '/routeTest/viewTwo', description: '演示自动路由 ViewTwo 页面' },
]

const route = useRoute()
</script>

<template>
  <div class="app-shell">
    <aside class="nav-panel">
      <div class="nav-brand">
        <p class="eyebrow">Support Console</p>
        <h1>Service Desk</h1>
        <p class="nav-subtitle">左侧导航，右侧工作区</p>
      </div>
      <nav class="nav-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ 'is-active': route.path.startsWith(link.to) }"
        >
          <span class="nav-link__label">{{ link.label }}</span>
          <span class="nav-link__desc">{{ link.description }}</span>
        </RouterLink>
      </nav>
    </aside>

    <section class="display-panel">
      <!-- <header class="display-header">
        <div>
          <p class="eyebrow">Workspace</p> 
        </div>
      </header> -->

      <div class="display-body">
        <RouterView v-slot="{ Component }">
          <component v-if="Component" :is="Component" class="display-component" />
          <div v-else class="empty-state">
            <h3>欢迎来到控制台</h3>
            <p>请选择左侧导航开始工作，或新建一个工单页面。</p>
          </div>
        </RouterView>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap');

:global(html, body, #app) {
  margin: 0;
  min-height: 100%;
  font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
  background: #050915;
  color: #e2e8f0;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
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