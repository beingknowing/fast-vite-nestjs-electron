import { defineStore } from 'pinia'
import { CredentialState, CredentialItem } from '@/types/orm_types'


export const useCredentialStore = defineStore('credential', {
    state(): CredentialState {

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
            return await window.electron.saveCredential(toRaw(this.$state))
        },
        async loadCredential() {
            const state = await window.electron.readCredential()
            this.setTableData(state)
        },
        async clearCredential() {
            await window.electron.clearCredential()
        },
        setTableData(state: CredentialState) {
            this.tableData = state.tableData
        }
    },

    persist: true
})
