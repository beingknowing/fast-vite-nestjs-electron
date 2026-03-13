import { Injectable } from "@nestjs/common";
import Store from "electron-store";
import { CredentialItem } from "@/types/orm_types";

function resolveStoreEncryptionKey(): string {
    const key = process.env.ELECTRON_STORE_ENCRYPTION_KEY?.trim();
    if (key) return key;

    // Keep data encrypted in local/dev usage even if env is missing.
    return "quickticket2queue-local-encryption-key";
}

@Injectable()
export class AppServiceCredential {
    private readonly envs: CredentialItem['env'][] = ['pfetst', 'pfestg', 'pfeprod']
    private store!: Store<{ "credential": CredentialItem[] }>;
    private readonly def: CredentialItem[] = [
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
    ];
    constructor() {
        this.initializeStore();
    }

    private initializeStore(): void {
        try {
            this.store = new Store({
                encryptionKey: resolveStoreEncryptionKey(),
                name: "credential",
            });
        } catch (error) {
            console.error("Failed to initialize credential store:", error);
            // Create a dummy store that won't fail on access
            this.store = new Store({ name: "credential_backup" });
        }
    }

    public async save(data: CredentialItem[]): Promise<true> {
        try {
            data.forEach(item => {
                item.env = this.envs.find(v => item.sn_host?.includes(v)) ?? 'pfetst'
            })
            this.store.set("credential", data);
        } catch (error) {
            console.error("Failed to save credential to store:", error);
        }
        return true;
    }

    public async read(): Promise<CredentialItem[]> {
        console.log(
            "🚀 ~ AppServiceCredential ~ read ~  store.path:",
            this.store.path,
        );

        try {
            const credential = this.store.get("credential")
            if (credential)
                return credential as CredentialItem[];
        } catch (error) {
            console.error("Failed to read credential from store:", error);
        }

        return this.def;
    }

    public async clear(): Promise<void> {
        try {
            // this.store.delete("credential");
            this.store.set("credential", this.def);
        } catch (error) {
            console.error("Failed to clear credential from store:", error);
        }
    }

    public async getCurrent() {
        const all = await this.read();
        const v =
            all.find((i) => i.isCurrent) ??
            all.find((i) => i.env == 'pfetst');
        return v!;
    }
}
