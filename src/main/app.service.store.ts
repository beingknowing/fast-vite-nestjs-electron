import { Injectable } from "@nestjs/common";
import { CredentialItem, TicketResult, TicketQueueOption } from "@/types/orm_types";
import { AppServiceCredential } from "./app.service.credential";
import { AppServiceTicketHistory } from "./app.service.ticket-history";
import { AppServiceTicketOptions } from "./app.service.ticket-options";

@Injectable()
export class AppServiceStore {
  constructor(
    private readonly credentialService: AppServiceCredential,
    private readonly ticketHistoryService: AppServiceTicketHistory,
    private readonly ticketOptionsService: AppServiceTicketOptions,
  ) { }

  // Credential methods
  public async saveCredential(data: CredentialItem[]): Promise<true> {
    return this.credentialService.save(data);
  }

  public async readCredential(): Promise<CredentialItem[]> {
    return this.credentialService.read();
  }

  public async clearCredential(): Promise<void> {
    return this.credentialService.clear();
  }

  public async getCurrent() {
    return this.credentialService.getCurrent();
  }

  // Ticket History methods
  public async saveTicketHistory(item: TicketResult): Promise<void> {
    return this.ticketHistoryService.save(item);
  }

  public async getTicketHistory(): Promise<TicketResult[]> {
    return this.ticketHistoryService.get();
  }

  public async clearTicketHistory(): Promise<void> {
    return this.ticketHistoryService.clear();
  }

  // Ticket Options methods
  public async getTicketOptions(): Promise<TicketQueueOption[]> {
    return this.ticketOptionsService.get();
  }

  public async addTicketOption(item: TicketQueueOption): Promise<void> {
    return this.ticketOptionsService.add(item);
  }

  public async deleteTicketOption(queue: string): Promise<void> {
    return this.ticketOptionsService.delete(queue);
  }

  public async resetTicketOptions(): Promise<TicketQueueOption[]> {
    return this.ticketOptionsService.reset();
  }
}
