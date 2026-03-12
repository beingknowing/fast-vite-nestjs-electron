import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { CredentialState, TicketResult } from "../../types/orm_types";

type StoreCtor = typeof Store;
const StoreConstructor = ((Store as unknown as { default?: StoreCtor }).default ??
  Store) as StoreCtor;

function resolveStoreEncryptionKey(): string {
  const key = process.env.ELECTRON_STORE_ENCRYPTION_KEY?.trim();
  if (key) return key;

  // Keep data encrypted in local/dev usage even if env is missing.
  return "fast-vite-nestjs-electron-local-encryption-key";
}

const storeCredential = new StoreConstructor({
  encryptionKey: resolveStoreEncryptionKey(),
  name: "setting_1",
});
const storeHistories = new StoreConstructor({
  // encryptionKey: resolveStoreEncryptionKey(),
  name: "setting_2",
});
@Injectable()
export class AppServiceStore {
  [x: string]: any;
  private readonly credentialStoreKey = "credential";
  public async saveCredential(data: CredentialState): Promise<true> {
    storeCredential.set(this.credentialStoreKey, data);
    return true;
  }
  public async readCredential(): Promise<CredentialState> {
    // store.path
    console.log(
      "🚀 ~ AppServiceStore ~ readCredential ~  store.path:",
      storeCredential.path,
    );
    const credential = (storeCredential.get(
      this.credentialStoreKey,
    ) as CredentialState) || {
      tableData: [
        {
          client_secret: "",
          client_id: "",
          sn_host: "https://pfetst.service-now.com",
          isCurrent: true,
          editing: false,
        },
        {
          client_secret: "",
          client_id: "",
          sn_host: "https://pfestg.service-now.com",
          isCurrent: false,
          editing: false,
        },
        {
          client_secret: "",
          client_id: "",
          sn_host: "https://pfeprod.service-now.com",
          isCurrent: false,
          editing: false,
        },
      ],
    };
    return credential;
  }

  public async getCurrent() {
    const all = await this.readCredential();
    let v =
      all.tableData.find((i) => i.isCurrent) ??
      all.tableData.find((i) => i.sn_host == "https://pfestg.service-now.com");
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
