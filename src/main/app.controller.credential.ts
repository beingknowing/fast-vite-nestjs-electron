import type { BrowserWindow } from 'electron'
import type { Observable } from 'rxjs'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { of } from 'rxjs'
import { AppService } from './app.service'
import { AppServiceStore } from './app.service.store'
import { CredentialState } from '../../types/orm_types'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Window() private readonly mainWin: BrowserWindow,
    private readonly store: AppServiceStore
  ) { }

  public async saveCredential(data: CredentialState): Promise<Observable<true>> {
    return of((await this.store.saveCredential(data)))
  }

  public async readCredential(): Promise<Observable<CredentialState>> {
    const credential = await this.store.ReadCredential()
    return of(credential)
  }

  @IpcHandle('msg')
  public handleSendMsg(@Payload() msg: string): Observable<string> {
    const { webContents } = this.mainWin
    webContents.send('reply-msg', 'this is msg from webContents.send')
    return of(`The main process received your message: ${msg} at time: ${this.appService.getTime()}`)
  }

}
