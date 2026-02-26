import { defineStore } from 'pinia'
import { TicketResponse, TicketType } from '../../../../types/orm_types'
import { computed, reactive, ref, toRaw } from 'vue'

export const fieldLabels = {
    userName: '工单提交人',
    title: '工单简要标题',
    content: '工单详细描述',
    queue_val: '队列',
} as const

type FieldKey = keyof typeof fieldLabels
type ValidationMessages = Record<FieldKey, string>

const createEmptyValidationMessages = (): ValidationMessages => ({
    userName: '',
    title: '',
    content: '',
    queue_val: '',
})

const requiredFields: FieldKey[] = ['userName', 'title', 'content']

export const useTicketStore = defineStore('ticket', () => {
    const ticket = reactive<TicketType>({
        title: '',
        content: '',
        queue_val: '',
        userName: '',
    } as TicketType)
    const validationMessages = reactive<ValidationMessages>(createEmptyValidationMessages())
    const result = ref<TicketResponse>()
    const isSubmitting = ref(false)

    const isFormValid = computed(() =>
        requiredFields.every((field) => (ticket[field] ?? '').trim().length > 0),
    )

    const resetValidationMessages = () => {
        Object.assign(validationMessages, createEmptyValidationMessages())
    }

    const setTicketField = (field: FieldKey, value: string) => {
        ticket[field] = value
    }

    const validateTicket = () => {
        resetValidationMessages()
        let firstError = ''
        requiredFields.forEach((field) => {
            const value = (ticket[field] ?? '').trim()
            if (!value) {
                const msg = `${fieldLabels[field]}不能为空`
                validationMessages[field] = msg
                if (!firstError) firstError = msg
            }
        })
        return firstError
    }

    const setResult = (payload?: TicketResponse) => {
        result.value = payload
    }

    const submitTicket = async () => {
        const validationError = validateTicket()
        if (validationError) {
            return validationError
        }

        try {
            isSubmitting.value = true
            setResult()
            const payload = toRaw(ticket)
            const res = await window.electron.ipcRenderer.invoke('ticket', payload)
            setResult(res)
            console.log('Submitting ticket:', payload, 'Queue:', payload.queue_val)
        } catch (error) {
            const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
            return message
        } finally {
            isSubmitting.value = false
        }

        return undefined
    }

    return {
        ticket,
        validationMessages,
        result,
        isSubmitting,
        isFormValid,
        setTicketField,
        resetValidationMessages,
        validateTicket,
        setResult,
        submitTicket,
    }
})