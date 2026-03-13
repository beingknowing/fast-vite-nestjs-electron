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
        currentKey(): CredentialItem['sn_host'] | undefined {
            return this.tableData.find((r) => r.isCurrent)?.sn_host ?? this.tableData[0]?.sn_host ?? undefined
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

        handleSave(row: CredentialItem) {
            // 默认：关闭所有编辑状态
            this.tableData.forEach((r) => {
                r.editing = false
            })
            if (row) {
                row.editing = false

            }
            // typedInvoke(ipcChannels.saveCredential, { tableData: toRaw(this.tableData) })
            window.electron.saveCredential(toRaw(this.$state))
        },
        setTableData(state: CredentialState) {
            this.tableData = state.tableData
        }
    },

    persist: true
})
