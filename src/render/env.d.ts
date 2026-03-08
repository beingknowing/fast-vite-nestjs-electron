// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    label: string;
    description: string;
    // is optional
    isAdmin?: boolean;
    // must be declared by every route
    requiresAuth?: boolean;
  }
}
