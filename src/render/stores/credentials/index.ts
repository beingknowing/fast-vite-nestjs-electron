import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import type { CredentialItem } from '@/types/orm_types'


export const useCredentialStore = defineStore('credential', {
    state(): { tableData: CredentialItem[] } {

        return {
            tableData: [
            ]
        }
    },


    getters: {
        currentKey(): CredentialItem['env'] | undefined {
            return this.tableData.find((r) => r.isCurrent)?.env ?? this.tableData[0]?.env ?? undefined
        }
    },

    actions: {
        setCurrent(env: CredentialItem['env']) {
            this.tableData.forEach((r) => {
                r.isCurrent = r.env === env
            })
        },

        handleEdit(row: CredentialItem) {
            row.editing = true
        },

        async handleSaveAll() {
            this.tableData.forEach((r) => {
                r.editing = false
            })
            // Use toRaw to unwrap reactive proxy for IPC serialization
            const data = toRaw(this.tableData)
            return await window.electron.saveCredential(data)
        },
        async loadCredential() {
            const state = await window.electron.readCredential()
            this.setTableData(state)
        },
        async clearCredential() {
            await window.electron.clearCredential()
        },
        setTableData(state: CredentialItem[]) {
            this.tableData = state
        }
    },

    persist: true
})
