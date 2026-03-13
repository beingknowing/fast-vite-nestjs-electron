import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { CredentialState, CredentialItem, TicketResult, TicketQueueOption } from "@/types/orm_types";

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

function resolveStoreEncryptionKey(): string {
  const key = process.env.ELECTRON_STORE_ENCRYPTION_KEY?.trim();
  if (key) return key;

  // Keep data encrypted in local/dev usage even if env is missing.
  return "quick-ticket-to-queue-local-encryption-key";
}

const storeCredential = new Store({
  encryptionKey: resolveStoreEncryptionKey(),
  name: "setting_1",
});
const storeHistories = new Store({
  // encryptionKey: resolveStoreEncryptionKey(),
  name: "setting_2",
});
@Injectable()
export class AppServiceStore {

  private readonly envs: CredentialItem['env'][] = ['pfetst', 'pfestg', 'pfeprod']
  private readonly credentialStoreKey = "credential";
  public async saveCredential(data: CredentialState): Promise<true> {
    data.tableData.forEach(item => {
      item.env = this.envs.find(v => item.sn_host?.includes(v)) ?? 'pfetst'
    })
    storeCredential.set(this.credentialStoreKey, data);
    return true;
  }
  public async readCredential(): Promise<CredentialState> {
    // store.path
    console.log(
      "🚀 ~ AppServiceStore ~ readCredential ~  store.path:",
      storeCredential.path,
    );

    const credential = storeCredential.get(this.credentialStoreKey)
    if (credential)
      return credential as CredentialState;
    const def: CredentialState = {
      tableData: [
        {
          client_secret: "",
          client_id: "",
          sn_host: "https://pfetst.service-now.com",
          isCurrent: true,
          editing: false,
          env: 'pfetst'
        },
        {
          env: 'pfestg',
          client_secret: "",
          client_id: "",
          sn_host: "https://pfestg.service-now.com",
          isCurrent: false,
          editing: false,
        },
        {
          env: 'pfeprod',
          client_secret: "",
          client_id: "",
          sn_host: "https://pfeprod.service-now.com",
          isCurrent: false,
          editing: false,
        },
      ],
    };
    return def
  }

  public async clearCredential(): Promise<void> {
    storeCredential.delete(this.credentialStoreKey);
  }

  public async getCurrent() {
    const all = await this.readCredential();
    const v =
      all.tableData.find((i) => i.isCurrent) ??
      all.tableData.find((i) => i.env == 'pfetst');
    return v!;
  }
  private readonly ticketHistoryStoreKey = "ticketHistory";
  private readonly ticketOptionsStoreKey = "ticketOptions";
  public async saveTicketHistory(item: TicketResult) {
    const history =
      (storeHistories.get(this.ticketHistoryStoreKey) as TicketResult[]) || [];
    if (history.find((i) => i.display_value === item.display_value)) {
      return;
    }
    history.unshift(item);
    storeHistories.set(this.ticketHistoryStoreKey, history);
  }

  public async getTicketHistory(): Promise<TicketResult[]> {
    const history =
      (storeHistories.get(this.ticketHistoryStoreKey) as TicketResult[]) || [];
    return history;
  }

  public async clearTicketHistory(): Promise<void> {
    storeHistories.delete(this.ticketHistoryStoreKey);
  }

  public async getTicketOptions(): Promise<TicketQueueOption[]> {
    const options =
      (storeHistories.get(this.ticketOptionsStoreKey) as TicketQueueOption[]) ||
      cloneDefaultTicketOptions();
    return options;
  }

  public async addTicketOption(item: TicketQueueOption): Promise<void> {
    const des = item.des?.trim();
    const queue = item.queue?.trim();
    if (!des || !queue) return;

    const options = await this.getTicketOptions();
    if (options.some((v) => v.queue === queue)) return;

    options.unshift({ des, queue });
    storeHistories.set(this.ticketOptionsStoreKey, options);
  }

  public async deleteTicketOption(queue: string): Promise<void> {
    const queueValue = queue?.trim();
    if (!queueValue) return;

    const options = await this.getTicketOptions();
    const next = options.filter((item) => item.queue !== queueValue);
    storeHistories.set(this.ticketOptionsStoreKey, next);
  }

  public async resetTicketOptions(): Promise<TicketQueueOption[]> {
    const options = cloneDefaultTicketOptions();
    storeHistories.set(this.ticketOptionsStoreKey, options);
    return options;
  }
}
