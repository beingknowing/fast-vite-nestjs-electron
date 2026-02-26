
import { defineStore } from 'pinia'
import { CredentialItem } from '../../../../types/orm_types'
import { reactive, ref } from 'vue'

export const useCredentialStore = defineStore('credential', () => {
    const tableData = reactive<CredentialItem[]>([
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
        },
    ])

    const currentKey = ref<string>(
        tableData.find((r) => r.isCurrent)?.key ?? tableData[0]?.key ?? ''
    )

    const setCurrent = (key: string) => {
        currentKey.value = key
        tableData.forEach((r) => {
            r.isCurrent = r.key === key
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
