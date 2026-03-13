import type { BrowserWindow } from "electron";
import { IpcHandle, Window } from "@doubleshot/nest-electron";
import { Controller } from "@nestjs/common";
import { Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { AppServiceStore } from "./app.service.store";
import type { CredentialItem, CredentialState } from "@/types/orm_types";

@Controller()
export class AppControllerCredential {
  constructor(
    _appService: AppService,
    @Window() _mainWin: BrowserWindow,
    private readonly store: AppServiceStore,
  ) {}

  @IpcHandle("saveCredential")
  public async saveCredential(@Payload() data: CredentialState): Promise<true> {
    return await this.store.saveCredential(data);
  }

  @IpcHandle("readCredential")
  public async readCredential(): Promise<CredentialState> {
    const credential = await this.store.readCredential();

    return credential;
  }
  @IpcHandle("getCurrent")
  public async getCurrent(): Promise<CredentialItem> {
    const item = this.store.getCurrent();
    return item;
  }
}
