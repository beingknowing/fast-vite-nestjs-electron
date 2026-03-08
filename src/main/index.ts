import type { MicroserviceOptions } from "@nestjs/microservices";
import { ElectronIpcTransport } from "@doubleshot/nest-electron";
import { NestFactory } from "@nestjs/core";
import { app, Menu } from "electron";
import { AppModule } from "./app.module";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
/**
 * Builds the application menu template.
 * This function can be extended to support i18n and custom menu configurations.
 *
 * @returns Menu template array for Electron
 */
function buildMenuTemplate(): Electron.MenuItemConstructorOptions[] {
  // Menu labels can be customized via environment variables or config
  const viewLabel = process.env.MENU_VIEW_LABEL || "View";
  return [
    {
      label: viewLabel,
      submenu: [{ role: "reload" }, { role: "toggleDevTools" }],
    },
  ];
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
