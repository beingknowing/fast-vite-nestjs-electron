import type { BrowserWindow } from 'electron'
import type { Observable } from 'rxjs'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { of } from 'rxjs'
import { AppService } from './app.service'
import { AppServiceStore } from './app.service.store'
import type { CredentialState } from '../../types/orm_types'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Window() private readonly mainWin: BrowserWindow,
    private readonly store: AppServiceStore
  ) { }

  @IpcHandle('saveCredential')
  public async saveCredential(@Payload() data: CredentialState): Promise<true> {
    return ((await this.store.saveCredential(data)))
  }

  @IpcHandle('readCredential')
  public async readCredential(): Promise<CredentialState> {
    const credential = await this.store.ReadCredential()
    return (credential)
  }

}
