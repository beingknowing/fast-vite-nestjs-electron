import {
  createWebHistory,
} from 'vue-router'
// import { experimental_createRouter as createRouter } from 'vue-router/experimental'
// import { resolver, handleHotUpdate } from 'vue-router/auto-resolver'
import { createRouter } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  // resolver,
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
