import { join } from "node:path";
import { ElectronModule } from "@doubleshot/nest-electron";
import { Module } from "@nestjs/common";
import { app, BrowserWindow } from "electron";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppControllerCredential } from "./app.controller.credential";
import { AppControllerTicket } from "./app.controller.ticket";
import { AppServiceTicket } from "./app.service.ticket";
import { AppServiceOS } from "./app.service.os";
import { AppServiceStore } from "./app.service.store";

type ForgeViteGlobals = {
  MAIN_WINDOW_VITE_DEV_SERVER_URL?: string;
  MAIN_WINDOW_VITE_NAME?: string;
};

@Module({
  imports: [
    ElectronModule.registerAsync({
      useFactory: async () => {
        const isDev = !app.isPackaged;
        const win = new BrowserWindow({
          width: 1280,
          height: 1024,
          autoHideMenuBar: false,
          webPreferences: {
            contextIsolation: true,
            preload: join(__dirname, 'preload', 'index.js'),
          },
        });

        win.on("closed", () => {
          win.destroy();
        });

        const forgeGlobals = globalThis as typeof globalThis & ForgeViteGlobals;
        const devServerUrl = process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL ?? forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL;
        const rendererName = forgeGlobals.MAIN_WINDOW_VITE_NAME ?? 'main_window';

        if (isDev && devServerUrl) {
          win.loadURL(devServerUrl);
        } else {
          win.loadFile(join(__dirname, '..', 'renderer', rendererName, 'index.html'));
        }


        return { win };
      },
    }),
  ],
  controllers: [AppController, AppControllerCredential, AppControllerTicket],
  providers: [AppService, AppServiceOS, AppServiceTicket, AppServiceStore],
})
export class AppModule { }
