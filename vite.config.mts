import { join } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePluginDoubleshot } from 'vite-plugin-doubleshot'

import VueRouter from 'unplugin-vue-router/vite'

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  root: join(__dirname, 'src/render'),
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
        filepath: 'types/.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
      dts: join(__dirname, 'types/auto-imports.d.ts'),
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
      dts: join(__dirname, 'types/components.d.ts')
    }),
    //图标的导入配置
    Icons({
      autoInstall: true,
    }),

    vue(),
    VitePluginDoubleshot({
      type: 'electron',
      main: 'dist/main/index.js',
      entry: 'src/main/index.ts',
      outDir: 'dist/main',
      external: ['electron'],
      electron: {
        build: {
          config: './electron-builder.config.js',
        },
        preload: {
          entry: 'src/preload/index.ts',
          outDir: 'dist/preload',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src/render'),
      '@render': join(__dirname, 'src/render'),
      '@main': join(__dirname, 'src/main'),
    },
  },
  base: './',
  build: {
    outDir: join(__dirname, 'dist/render'),
    emptyOutDir: true,
  },
})
