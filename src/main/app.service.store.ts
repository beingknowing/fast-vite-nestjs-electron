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
        const credential = store.get(this.storeKey) as CredentialState || {}
        return credential
    }

    public async getCurrent() {
        const all = await this.readCredential()
        let v = all.tableData.find(i => i.isCurrent) ?? all.tableData.find(i => i.key == 'test')
        return v
    }
}
