<p align="center">
    <img width="400" src="./logo.png" alt="logo">
</p>

# ⚡Vite + Electron + Nestjs Template

This template is used to build [vite](https://vitejs.dev/) + [electron](https://www.electronjs.org/) + [nestjs](https://nestjs.com/) projects.
It now uses **Electron Forge + official Vite plugin** for development and packaging.

This is a vue version of the template, you can also use:

- [React template](https://github.com/ArcherGu/vite-react-nestjs-electron)
- [Svelte.js template](https://github.com/ArcherGu/vite-svelte-nestjs-electron)

## Introduce

This is a template based on my repo: [fast-vite-electron](https://github.com/ArcherGu/fast-vite-electron). In the main process, I integrated nestjs. In the main process, you can build your code just as you would write a nestjs backend. Desktop clients built from this template can quickly split the electron when you need to switch to B/S.

## Features

- 🔨 [@electron-forge/plugin-vite](https://www.electronforge.io/config/plugins/vite) to build main/preload/renderer.
  <br>

- 🛻 An electron ipc transport for [nestjs](https://nestjs.com/) that provides simple ipc communication.
  <br>

- 🪟 An electron module for [nestjs](https://nestjs.com/) to launch electron windows.
  <br>

- ⏩ Quick start and packaging with [Electron Forge](https://www.electronforge.io/)

## Build Stack

- Main process: NestJS + Electron
- Renderer: Vue + Vite
- Packaging: Electron Forge (`maker-squirrel`)
- Config files: TypeScript (`forge.config.ts`, `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`)

## How to use

- Click the [Use this template](https://github.com/ArcherGu/fast-vite-electron/generate) button (you must be logged in) or just clone this repo.
- In the project folder:

  ```bash
  # install dependencies
  pnpm install

  # run in developer mode
  pnpm dev

  # package app directory only
  pnpm package

  # build windows installer
  pnpm build
  ```

## Forge Commands

```bash
# make distributables (default)
pnpm make

# for certificate-chain-restricted environments
pnpm make:insecure
```

## Note for PNPM

This project requires `pnpm` as the package manager.
Electron Forge + pnpm requires hoisted dependency layout.

```
node-linker=hoisted
```

```
public-hoist-pattern=*
```

```
shamefully-hoist=true
```

If your network MITMs TLS (corporate proxy / private CA), you may need one of:

- trust your corporate root CA in Node,
- use mirror/proxy settings in `.npmrc`,
- temporarily run `pnpm make:insecure`.

## Relative

My blog post:

- [极速 DX Vite + Electron + esbuild](https://archergu.me/posts/vite-electron-esbuild)
- [用装饰器给 Electron 提供一个基础 API 框架](https://archergu.me/posts/electron-decorators)
