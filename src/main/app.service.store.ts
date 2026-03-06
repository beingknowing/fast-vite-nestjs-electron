import { Injectable } from '@nestjs/common'
import Store from 'electron-store'
import { CredentialState } from "../../types/orm_types"
const store = new Store({});

@Injectable()
export class AppServiceStore {

    private readonly storeKey = 'credential'
    public async saveCredential(data: CredentialState): Promise<true> {
        store.set(this.storeKey, data)
        return true
    }
    public async readCredential(): Promise<CredentialState> {
        const credential = store.get(this.storeKey) as CredentialState || {
            tableData: [
                {
                    client_secret: '',
                    client_id: '',
                    sn_host: 'https://pfetst.service-now.com',
                    isCurrent: true,
                    editing: false,
                },
                {
                    client_secret: '',
                    client_id: '',
                    sn_host: 'https://pfeprod.service-now.com',
                    isCurrent: false,
                    editing: false,
                },
                {
                    client_secret: '',
                    client_id: '',
                    sn_host: 'https://pfestg.service-now.com',
                    isCurrent: false,
                    editing: false,
                }
            ],
        }
        return credential
    }

    public async getCurrent() {
        const all = await this.readCredential()
        let v = all.tableData.find(i => i.isCurrent) ?? all.tableData.find(i => i.sn_host == 'test')
        return v
    }
}
