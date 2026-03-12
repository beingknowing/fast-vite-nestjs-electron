import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
// Use require syntax to bypass TS module resolution issues while maintaining runtime functionality
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

import { resolve } from "node:path";
import VueRouter from 'unplugin-vue-router/vite'
// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { mode, forgeConfigSelf, command } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: resolve(__dirname, 'src/render'),
    mode,
    // In packaged Electron apps we load via file://, so assets must be relative.
    base: command === 'serve' ? '/' : './',
    build: {
      sourcemap: "inline", // 调试，必须开启
      outDir: `.vite/renderer/${name}`,
      rollupOptions: {
        input: {
          [name]: resolve(__dirname, 'src/render/index.html'),
        },
      }
    },
    plugins: [
      VueRouter({
        routesFolder: 'src/render/views', // 扫描页面的目录
        dts: 'types/typed-router.d.ts', // 自动生成类型定义文件
      }),
      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
        ],
        imports: [
          'vue',
          'vue-router',
          'pinia'
        ],
        eslintrc: {
          enabled: true, // Default `false`
          // filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
        dts: resolve(__dirname, 'types/auto-imports.d.ts'),
        resolvers: [
          ElementPlusResolver(),
          // 自动导入图标组件 
          IconsResolver({
            prefix: 'Icon',
          })
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep'],
          })
        ],
        dts: resolve(__dirname, 'types/components.d.ts')
      }),
      //图标的导入配置
      Icons({
        autoInstall: true,
      }),


      pluginExposeRenderer(name),
      vue({}),
    ],
    resolve: {
      // preserveSymlinks: true,
      alias: {
        '@': resolve(__dirname, './src/render'),
        '@render': resolve(__dirname, './src/render'),
        '@main': resolve(__dirname, './src/main')
        // '@': fileURLToPath(new URL('./src/renderer', import.meta.url))

      }
    },

    clearScreen: true,
  } as UserConfig;
});
