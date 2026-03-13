import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { TicketResult } from "@/types/orm_types";

@Injectable()
export class AppServiceTicketHistory {
    private store!: Store<{ "ticketHistory": TicketResult[] }>;

    constructor() {
        this.initializeStore();
    }

    private initializeStore(): void {
        try {
            this.store = new Store({
                name: "ticketHistory",
            });
        } catch (error) {
            console.error("Failed to initialize ticket history store:", error);
            // Create a dummy store that won't fail on access
            this.store = new Store({ name: "ticketHistory_backup" });
        }
    }

    public async save(item: TicketResult): Promise<void> {
        try {

            this.store.appendToArray("ticketHistory", item);
        } catch (error) {
            console.error("Failed to save ticket history to store:", error);
        }
    }

    public async get(): Promise<TicketResult[]> {
        try {
            const history = this.store.get("ticketHistory", [])
            return history;
        } catch (error) {
            console.error("Failed to read ticket history from store:", error);
            return [];
        }
    }

    public async clear(): Promise<void> {
        try {
            this.store.clear();
        } catch (error) {
            console.error("Failed to clear ticket history from store:", error);
        }
    }
}
