import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { TicketQueueOption } from "@/types/orm_types";

const defaultTicketOptions: TicketQueueOption[] = [
    { des: "域名申请、解析", queue: "GBL-NETWORK DDI" },
    { des: "China Support/update L1 KB", queue: "CHN-WPO-APP SUPPORT" },
    { des: "本地应用运维", queue: "CHN-LOCAL APP DEVOPS" },
    { des: "China IICS Platform Support Queue and DL", queue: "CHN-IICS PLATFORM SUPPORT" },
    { des: "CHN-DEP NG APPROVAL", queue: "CHN-DEP NG APPROVAL" },
    { des: "VPN相关问题", queue: "GBL-NETWORK VPN" },
];

function cloneDefaultTicketOptions(): TicketQueueOption[] {
    return defaultTicketOptions.map((item) => ({ ...item }));
}

@Injectable()
export class AppServiceTicketOptions {
    private store!: Store<{ "ticketOptions": TicketQueueOption[] }>;

    constructor() {
        this.initializeStore();
    }

    private initializeStore(): void {
        try {
            this.store = new Store({
                name: "ticketOptions",
            });
        } catch (error) {
            console.error("Failed to initialize ticket options store:", error);
            // Create a dummy store that won't fail on access
            this.store = new Store({ name: "ticketOptions_backup" });
        }
    }

    public async get(): Promise<TicketQueueOption[]> {
        try {
            const options =
                this.store.get("ticketOptions", cloneDefaultTicketOptions());
            return options;
        } catch (error) {
            console.error("Failed to read ticket options from store:", error);
            return cloneDefaultTicketOptions();
        }
    }

    public async add(item: TicketQueueOption): Promise<void> {
        try {
            const des = item.des?.trim();
            const queue = item.queue?.trim();
            if (!des || !queue) return;

            const options = await this.get();
            if (options.some((v) => v.queue === queue)) return;

            options.unshift({ des, queue });
            this.store.set("ticketOptions", options);
        } catch (error) {
            console.error("Failed to add ticket option to store:", error);
        }
    }

    public async delete(queue: string): Promise<void> {
        try {
            const queueValue = queue?.trim();
            if (!queueValue) return;

            const options = await this.get();
            const next = options.filter((item) => item.queue !== queueValue);
            this.store.set("ticketOptions", next);
        } catch (error) {
            console.error("Failed to delete ticket option from store:", error);
        }
    }

    public async reset(): Promise<TicketQueueOption[]> {
        try {
            const options = cloneDefaultTicketOptions();
            this.store.set("ticketOptions", options);
            return options;
        } catch (error) {
            console.error("Failed to reset ticket options in store:", error);
            return cloneDefaultTicketOptions();
        }
    }
}
