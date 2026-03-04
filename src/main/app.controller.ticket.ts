import { IpcHandle } from '@doubleshot/nest-electron'
import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import type { TicketResponse, TicketType } from '../../types/orm_types'
import { AppServiceTicket } from './app.service.ticket'
import { AppServiceOS } from './app.service.os'

@Controller()
export class AppControllerTicket {
  constructor(
    private readonly ticketService: AppServiceTicket,
    private readonly osservice: AppServiceOS
  ) { }

  @IpcHandle('ticket')
  public async onTicketSubmit(@Payload() data: TicketType): Promise<TicketResponse> {
    return (await this.ticketService.submitTicket(data))
  }

  @IpcHandle('get-domain-user')
  public async getUserName(): Promise<string> {
    return (this.osservice.getUserName())
  }


}
