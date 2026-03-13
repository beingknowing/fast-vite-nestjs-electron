import { join } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { VitePluginDoubleshot } from "vite-plugin-doubleshot";

import VueRouter from "vue-router/vite";
import { VueRouterAutoImports } from "vue-router/unplugin";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

const electronPublishMode =
  process.env.ELECTRON_BUILDER_PUBLISH === "always" ? "always" : "never";

// https://vitejs.dev/config/
export default defineConfig({
  root: join(__dirname, "src/render"),
  plugins: [
    VueRouter({
      routesFolder: ["src/render/views"], // 扫描页面的目录
      dts: "types/auto-gen/route-map.d.ts", // 自动生成类型定义文件
      exclude: ["**/_layout.vue"], // 排除 layout 文件
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ["vue", VueRouterAutoImports, "pinia"],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: "types/auto-gen/.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
      dts: join(__dirname, "types/auto-gen/auto-imports.d.ts"),
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: "Icon",
        }),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ["ep"],
        }),
      ],
      dts: join(__dirname, "types/auto-gen/components.d.ts"),
    }),
    //图标的导入配置
    Icons({
      autoInstall: true,
    }),

    vue(),
    VitePluginDoubleshot({
      waitTimeout: 50_000, // 等待主进程启动的超时时间，单位为毫秒
      type: "electron",
      main: "dist/main/index.js",
      entry: "src/main/index.ts",
      outDir: "dist/main",
      external: [
        // ...Object.keys(pkg.dependencies || {}),
        "electron",
        /^node:/, // 排除 node 原生模块
      ],
      electron: {
        build: {
          config: "./electron-builder.config.ts",
          cliOptions: {
            publish: electronPublishMode,
          },
        },
        preload: {
          entry: "src/preload/index.ts",
          outDir: "dist/preload",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": join(__dirname, "src/render"),
      "@render": join(__dirname, "src/render"),
      "@main": join(__dirname, "src/main"),
    },
  },
  base: "./",
  build: {
    sourcemap: process.env.npm_lifecycle_event !== "build",
    outDir: join(__dirname, "dist/render"),
    emptyOutDir: true,
    rollupOptions: {
      // 将 package.json 中的所有依赖排除在打包之外
      external: [
        // ...Object.keys(pkg.dependencies || {}),
        "electron",
        /^node:/, // 排除 node 原生模块
      ],
    },
  },
});
