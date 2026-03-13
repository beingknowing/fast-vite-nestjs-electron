import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { CredentialState, CredentialItem, TicketResult } from "@/types/orm_types";

function resolveStoreEncryptionKey(): string {
  const key = process.env.ELECTRON_STORE_ENCRYPTION_KEY?.trim();
  if (key) return key;

  // Keep data encrypted in local/dev usage even if env is missing.
  return "fast-vite-nestjs-electron-local-encryption-key";
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
}
