import type { MicroserviceOptions } from "@nestjs/microservices";
import { ElectronIpcTransport } from "@doubleshot/nest-electron";
import { NestFactory } from "@nestjs/core";
import { app, dialog, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import { AppModule } from "./app.module";
import { buildMenuTemplate } from "./buildMenuTemplate";
import 'reflect-metadata';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("Auto update error:", error);
  });

  autoUpdater.on("update-available", (info) => {
    // eslint-disable-next-line no-console
    console.log("Update available:", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    // eslint-disable-next-line no-console
    console.log("No updates available");
  });

  autoUpdater.on("update-downloaded", async () => {
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

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(error);
    app.quit();
  }
}

bootstrap();
