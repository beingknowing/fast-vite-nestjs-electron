import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { CredentialState, TicketResult } from "../../types/orm_types";
const store = new Store({});

@Injectable()
export class AppServiceStore {
  [x: string]: any;
  private readonly credentialStoreKey = "credential";
  public async saveCredential(data: CredentialState): Promise<true> {
    store.set(this.credentialStoreKey, data);
    return true;
  }
  public async readCredential(): Promise<CredentialState> {
    // store.path
    console.log(
      "🚀 ~ AppServiceStore ~ readCredential ~  store.path:",
      store.path,
    );
    const credential = (store.get(
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
      (store.get(this.ticketHistoryStoreKey) as TicketResult[]) || [];
    if (history.find((i) => i.display_value === item.display_value)) {
      return;
    }
    history.unshift(item);
    store.set(this.ticketHistoryStoreKey, history);
  }

  public async getTicketHistory(): Promise<TicketResult[]> {
    const history =
      (store.get(this.ticketHistoryStoreKey) as TicketResult[]) || [];
    return history;
  }

  public async clearTicketHistory(): Promise<void> {
    store.delete(this.ticketHistoryStoreKey);
  }
}
