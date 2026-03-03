import type { BrowserWindow } from 'electron'
import type { Observable } from 'rxjs'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { of } from 'rxjs'
import { AppService } from './app.service'
import type { TicketResponse, TicketType } from '../../types/orm_types'
import { AppServiceTicket } from './app.service.ticket'
import { AppServiceOS } from './app.service.os'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Window() private readonly mainWin: BrowserWindow,
    private readonly ticketService: AppServiceTicket,
    private readonly osservice: AppServiceOS
  ) { }

  @IpcHandle('ticket')
  public async onTicketSubmit(@Payload() data: TicketType): Promise<Observable<TicketResponse>> {
    return of(await this.ticketService.submitTicket(data))
  }

  @IpcHandle('get-domain-user')
  public async getUserName(): Promise<Observable<string>> {
    return of(this.osservice.getUserName())
  }

  @IpcHandle('msg')
  public handleSendMsg(@Payload() msg: string): Observable<string> {
    const { webContents } = this.mainWin
    webContents.send('reply-msg', 'this is msg from webContents.send')
    return of(`The main process received your message: ${msg} at time: ${this.appService.getTime()}`)
  }

}
