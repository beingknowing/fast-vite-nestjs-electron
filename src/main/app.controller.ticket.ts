import { IpcHandle } from "@doubleshot/nest-electron";
import { Controller } from "@nestjs/common";
import { Payload } from "@nestjs/microservices";
import type {
  TicketQueueOption,
  TicketResponse,
  TicketResult,
  TicketType,
} from "@/types/orm_types";
import { AppServiceTicket } from "./app.service.ticket";
import { AppServiceOS } from "./app.service.os";
import { AppServiceStore } from "./app.service.store";

@Controller()
export class AppControllerTicket {
  constructor(
    private readonly ticketService: AppServiceTicket,
    private readonly osservice: AppServiceOS,
    private readonly store: AppServiceStore,
  ) { }

  @IpcHandle("ticket")
  public async onTicketSubmit(
    @Payload() data: TicketType,
  ): Promise<TicketResponse> {
    console.log("🚀 ~ AppControllerTicket ~ onTicketSubmit ~ data:", data);
    return await this.ticketService.submitTicket(data);
  }

  @IpcHandle("get-domain-user")
  public async getUserName(): Promise<string> {
    return this.osservice.getUserName();
  }

  @IpcHandle("get-ticket-history")
  public async getTicketHistory(): Promise<TicketResult[]> {
    return await this.store.getTicketHistory();
  }

  @IpcHandle("clear-ticket-history")
  public async clearTicketHistory(): Promise<void> {
    await this.store.clearTicketHistory();
  }

  @IpcHandle("save-ticket-history")
  public async saveTicketHistory(item: TicketResult): Promise<void> {
    await this.store.saveTicketHistory(item);
  }

  @IpcHandle("get-ticket-options")
  public async getTicketOptions(): Promise<TicketQueueOption[]> {
    return await this.store.getTicketOptions();
  }

  @IpcHandle("add-ticket-option")
  public async addTicketOption(@Payload() item: TicketQueueOption): Promise<void> {
    await this.store.addTicketOption(item);
  }

  @IpcHandle("delete-ticket-option")
  public async deleteTicketOption(@Payload() queue: string): Promise<void> {
    await this.store.deleteTicketOption(queue);
  }

  @IpcHandle("reset-ticket-options")
  public async resetTicketOptions(): Promise<TicketQueueOption[]> {
    return await this.store.resetTicketOptions();
  }
}
