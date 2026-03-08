import { createWebHistory } from "vue-router";
// import { experimental_createRouter as createRouter } from 'vue-router/experimental'
// import { resolver, handleHotUpdate } from 'vue-router/auto-resolver'
import { createRouter } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";

// Add default route redirect by creating a new array to avoid mutating the auto-generated routes
const appRoutes = [
  {
    path: "/",
    redirect: "/ticket/ticket",
  },
  ...routes,
];

export const router = createRouter({
  history: createWebHistory(),
  // resolver,
  routes: appRoutes,
});

if (import.meta.hot) {
  handleHotUpdate(router);
}
