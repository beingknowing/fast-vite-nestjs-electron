import type { MicroserviceOptions } from "@nestjs/microservices";
import { ElectronIpcTransport } from "@doubleshot/nest-electron";
import { NestFactory } from "@nestjs/core";
import { app, dialog, Menu, shell } from "electron";
import { autoUpdater } from "electron-updater";
import { AppModule } from "./app.module";
import { buildMenuTemplate } from "./buildMenuTemplate";
import 'reflect-metadata';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

const DEFAULT_GITHUB_REPOSITORY = "beingknowing/fast-vite-nestjs-electron";

function isPortableWindowsBuild(): boolean {
  return process.platform === "win32" && Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
}

function getGitHubReleasesUrl(): string {
  const repository = process.env.GITHUB_REPOSITORY || DEFAULT_GITHUB_REPOSITORY;
  return `https://github.com/${repository}/releases/latest`;
}

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  const isPortableWindows = isPortableWindowsBuild();
  const releasesUrl = getGitHubReleasesUrl();

  autoUpdater.autoDownload = !isPortableWindows;
  autoUpdater.autoInstallOnAppQuit = !isPortableWindows;

  autoUpdater.on("error", (error) => {
    console.error("Auto update error:", error);
  });

  autoUpdater.on("update-available", async (info) => {
    console.log("Update available:", info.version);

    if (!isPortableWindows) return;

    const { response } = await dialog.showMessageBox({
      type: "info",
      buttons: ["Download", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update Available",
      message: `A new version (${info.version}) is available.`,
      detail: "Portable builds do not support in-place auto install. Open GitHub Releases to download the latest portable package.",
    });

    if (response === 0) {
      await shell.openExternal(releasesUrl);
    }
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No updates available");
  });

  autoUpdater.on("update-downloaded", async () => {
    if (isPortableWindows) return;

    const { response } = await dialog.showMessageBox({
      type: "info",
      buttons: ["Restart and Install", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update Ready",
      message: "A new version has been downloaded. Restart now to install it?",
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  const checkForUpdates = isPortableWindows
    ? autoUpdater.checkForUpdates()
    : autoUpdater.checkForUpdatesAndNotify();

  checkForUpdates.catch((error) => {
    console.error("Failed to check for updates:", error);
  });
}

async function electronAppInit() {
  const isDev = !app.isPackaged;
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  if (isDev) {
    if (process.platform === "win32") {
      process.on("message", (data) => {
        if (data === "graceful-exit") app.quit();
      });
    } else {
      process.on("SIGTERM", () => {
        app.quit();
      });
    }
  }

  if (isDev) {
    // Build application menu with configurable labels
    const menuTemplate = buildMenuTemplate();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  }

  await app.whenReady();
  setupAutoUpdater();
}

async function bootstrap() {
  try {
    await electronAppInit();

    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        strategy: new ElectronIpcTransport("IpcTransport"),
      },
    );

    await nestApp.listen();
  } catch (error) {
    console.log(error);
    app.quit();
  }
}

bootstrap();
