import { defineStore } from 'pinia'
import { CredentialState, CredentialItem } from '../../../../types/orm_types'
import { toRaw } from 'vue'

export const useCredentialStore = defineStore('credential', {
    state(): CredentialState {
        return {
            tableData: [
                {
                    key: 'prod',
                    client_secret: '',
                    client_id: '',
                    sn_host: '',
                    isCurrent: true,
                    editing: false,
                },
                {
                    key: 'test',
                    client_secret: '',
                    client_id: '',
                    sn_host: '',
                    isCurrent: false,
                    editing: false,
                },
                {
                    key: 'stage',
                    client_secret: '',
                    client_id: '',
                    sn_host: '',
                    isCurrent: false,
                    editing: false,
                }
            ]
        }
    },

    getters: {
        currentKey(): CredentialItem['key'] | undefined {
            return this.tableData.find((r) => r.isCurrent)?.key ?? this.tableData[0]?.key ?? undefined
        }
    },

    actions: {
        setCurrent(key: CredentialItem['key']) {
            this.tableData.forEach((r) => {
                r.isCurrent = r.key === key
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
            window.electron.ipcRenderer.invoke('saveCredential', toRaw(this.tableData))
        }
    },

    persist: true
})
