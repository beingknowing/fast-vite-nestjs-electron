
import { defineStore } from 'pinia'
import { CredentialItem } from '../../../../types/orm_types'
import { reactive, ref } from 'vue'

export const useCredentialStore = defineStore('credential', () => {
    const tableData = reactive<CredentialItem[]>([
        {

            client_secret: '',
            client_id: '',
            sn_host: '',
            isCurrent: true,
            editing: false,
        },
        {

            client_secret: '',
            client_id: '',
            sn_host: '',
            isCurrent: false,
            editing: false,
        },
        {
            sn_host: 'stage',
            client_secret: '',
            client_id: '',
            sn_host: '',
            isCurrent: false,
            editing: false,
        },
    ])

    const currentKey = ref<string>(
        tableData.find((r) => r.isCurrent)?.sn_host ?? tableData[0]?.sn_host ?? ''
    )

    const setCurrent = (sn_host: string) => {
        currentKey.value = sn_host
        tableData.forEach((r) => {
            r.isCurrent = r.sn_host === sn_host
        })
    }

    const handleEdit = (row: CredentialItem) => {
        row.editing = true
    }

    const handleSave = (row?: CredentialItem) => {
        if (row) {
            row.editing = false
            return
        }
        // 默认：关闭所有编辑状态
        tableData.forEach((r) => {
            r.editing = false
        })
    }

    // delete functionality removed

    // `handleAdd` removed — creation of rows is handled elsewhere if needed

    return {
        tableData,
        currentKey,
        setCurrent,
        handleEdit,
        handleSave,
    }
}, {
    persist: true
})
